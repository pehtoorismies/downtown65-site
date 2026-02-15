/** biome-ignore-all lint/suspicious/noConsole: script */
import fs, { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { EventTypeEnum, ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import z from 'zod'

// DynamoDB JSON type unwrappers
const DStr = z.object({ S: z.string() }).transform((o) => o.S)
const DBool = z.object({ BOOL: z.boolean() }).transform((o) => o.BOOL)

const CreatedBySchema = z
  .object({
    M: z.object({
      id: DStr,
      nickname: DStr,
      picture: DStr,
    }),
  })
  .transform((o) => o.M)

const ParticipantEntrySchema = z
  .object({
    M: z
      .object({
        id: DStr,
        joinedAt: DStr,
      })
      .passthrough(),
  })
  .transform((o) => ({ joinedAt: o.M.joinedAt, sub: o.M.id }))

const ParticipantsSchema = z
  .object({
    M: z.record(z.string(), ParticipantEntrySchema),
  })
  .transform(({ M }) => Object.values(M))
  .optional()
  .transform((val) => val ?? [])

export const DynamoEventSchema = z
  .object({
    _ct: DStr.pipe(z.iso.datetime()),
    _md: DStr.pipe(z.iso.datetime()),
    createdBy: CreatedBySchema,
    dateStart: DStr.pipe(ISODateSchema),
    description: DStr.optional().transform((val) => {
      if (!val || val === '') return null
      return val
    }),
    eventId: DStr.pipe(z.ulid()),
    location: DStr,
    participants: ParticipantsSchema,
    race: DBool,
    subtitle: DStr,
    timeStart: DStr.optional().transform((val) => {
      if (!val || val === '') return null
      return ISOTimeSchema.parse(val)
    }),
    title: DStr.pipe(z.string().trim().min(1)),
    type: DStr.pipe(EventTypeEnum),
  })
  .transform((obj) => {
    const { _ct, _md, type, eventId, ...rest } = obj
    return {
      ...rest,
      createdAt: _ct,
      eventType: type,
      eventULID: eventId,
      updatedAt: _md,
    }
  })

type ParsedEvent = z.infer<typeof DynamoEventSchema>

const UserSchema = z
  .object({
    'Created At': z.iso.datetime(),
    Id: z.string(),
    Nickname: z.string(),
    Picture: z.string(),
  })
  .transform((obj) => ({
    createdAt: obj['Created At'],
    nickname: obj.Nickname,
    picture: obj.Picture,
    sub: obj.Id,
  }))

type ParsedUser = z.infer<typeof UserSchema> & { id: number }

const readUsersFromFile = async (filePath: string): Promise<ParsedUser[]> => {
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    crlfDelay: Infinity,
    input: fileStream,
  })

  const users: z.infer<typeof UserSchema>[] = []
  let lineNumber = 0

  for await (const line of rl) {
    lineNumber++
    if (line.trim() === '') continue

    try {
      const result = UserSchema.safeParse(JSON.parse(line))
      if (!result.success) {
        console.warn(
          `users.json:${lineNumber} - Parse error:`,
          result.error.issues[0],
        )
        continue
      }
      users.push(result.data)
    } catch (err) {
      console.warn(
        `users.json:${lineNumber} - JSON parse error:`,
        (err as Error).message,
      )
    }
  }

  return users
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    .map((user, index) => ({ ...user, id: index + 1 }))
}

const readEventsFromImportDir = async (importDir: string) => {
  const files = await readdir(importDir)
  const jsonFiles = files.filter((f) => f.endsWith('.json'))

  console.log(`Found ${jsonFiles.length} JSON files in ${importDir}`)

  const allEvents: ParsedEvent[] = []

  for (const file of jsonFiles) {
    const filePath = join(importDir, file)
    console.log(`Reading ${file}...`)

    const fileStream = createReadStream(filePath)
    const rl = createInterface({
      crlfDelay: Infinity,
      input: fileStream,
    })

    let lineNumber = 0
    for await (const line of rl) {
      lineNumber++
      if (line.trim() === '') continue

      try {
        const parsed = JSON.parse(line)
        const result = DynamoEventSchema.safeParse(parsed.Item)

        if (!result.success) {
          console.warn(
            `${file}:${lineNumber} - Parse error:`,
            result.error.issues[0],
          )
          continue
        }

        allEvents.push(result.data)
      } catch (err) {
        console.warn(
          `${file}:${lineNumber} - JSON parse error:`,
          (err as Error).message,
        )
      }
    }
  }

  return allEvents.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

const escapeSQL = (value: string): string => {
  return value.replace(/'/g, "''")
}

const generateUserInsertStatements = (users: ParsedUser[]): string => {
  const statements: string[] = []

  statements.push('-- User seed data')
  statements.push(`-- Total users: ${users.length}`)
  statements.push('')

  for (const user of users) {
    statements.push(
      `INSERT INTO users (sub, nickname, picture) VALUES ('${escapeSQL(user.sub)}', '${escapeSQL(user.nickname)}', '${escapeSQL(user.picture)}');`,
    )
  }

  return statements.join('\n')
}

const generateEventInsertStatements = (
  events: ParsedEvent[],
  userIdMap: Map<string, number>,
): string => {
  const statements: string[] = []

  statements.push('-- Event seed data (from DynamoDB import)')
  statements.push(`-- Total events: ${events.length}`)
  statements.push('')

  for (const event of events) {
    const creatorId = userIdMap.get(event.createdBy.id)

    if (!creatorId) {
      console.warn(
        `Skipping event "${event.title}" - creator "${event.createdBy.id}" not found in users`,
      )
      continue
    }

    const values = [
      `'${escapeSQL(event.eventULID)}'`,
      `'${escapeSQL(event.title)}'`,
      `'${escapeSQL(event.subtitle)}'`,
      event.description ? `'${escapeSQL(event.description)}'` : 'NULL',
      `'${event.eventType}'`,
      `'${event.dateStart}'`,
      event.timeStart ? `'${event.timeStart}'` : 'NULL',
      `'${escapeSQL(event.location)}'`,
      event.race ? '1' : '0',
      `'${event.createdAt}'`,
      `'${event.updatedAt}'`,
      creatorId.toString(),
    ]

    statements.push(
      `INSERT INTO events (eventULID, title, subtitle, description, eventType, dateStart, timeStart, location, race, createdAt, updatedAt, creatorId) VALUES (${values.join(', ')});`,
    )
  }

  return statements.join('\n')
}

const generateParticipantInsertStatements = (
  events: ParsedEvent[],
  userIdMap: Map<string, number>,
): string => {
  const statements: string[] = []

  statements.push('-- Participant seed data (users_to_events)')
  let totalParticipants = 0
  const skippedSubs = new Map<
    string,
    { events: { title: string; ulid: string }[] }
  >()

  // Events are sorted by createdAt, so eventId = index + 1
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const eventId = i + 1

    // Skip events whose creator wasn't found (they were skipped in event inserts)
    if (!userIdMap.has(event.createdBy.id)) {
      throw new Error(
        `Event "${event.title}" has creator "${event.createdBy.id}" which is missing from users. This should have been caught during event insert generation.`,
      )
    }

    for (const participant of event.participants) {
      const userId = userIdMap.get(participant.sub)
      if (!userId) {
        const existing = skippedSubs.get(participant.sub)
        if (existing) {
          existing.events.push({ title: event.title, ulid: event.eventULID })
        } else {
          skippedSubs.set(participant.sub, {
            events: [{ title: event.title, ulid: event.eventULID }],
          })
        }
        continue
      }

      totalParticipants++
      statements.push(
        `INSERT INTO users_to_events (userId, eventId, createdAt) VALUES (${userId}, ${eventId}, '${escapeSQL(participant.joinedAt)}');`,
      )
    }
  }

  if (skippedSubs.size > 0) {
    console.warn(
      `Skipped participants with unknown sub (${skippedSubs.size} unique):`,
    )
    for (const [sub, { events }] of skippedSubs) {
      console.warn(`  ${sub}`)
      for (const e of events) {
        console.warn(`    - ${e.title} (${e.ulid})`)
      }
    }
  }

  statements.unshift(`-- Total participants: ${totalParticipants}`)
  statements.unshift('')

  return statements.join('\n')
}

const main = async () => {
  try {
    // Read users
    const users = await readUsersFromFile('.import/users/users.json')
    console.log(`Parsed ${users.length} users`)

    const userIdMap = new Map(users.map((u) => [u.sub, u.id]))

    // Read events
    const events = await readEventsFromImportDir('.import')
    console.log(`Parsed ${events.length} events`)

    if (events.length > 0) {
      console.log(
        `Date range: ${events[0].createdAt} to ${events[events.length - 1].createdAt}`,
      )
    }

    // Generate SQL
    const userInserts = generateUserInsertStatements(users)
    const eventInserts = generateEventInsertStatements(events, userIdMap)
    const participantInserts = generateParticipantInsertStatements(
      events,
      userIdMap,
    )

    const sqlContent = [
      '-- Seed data (from DynamoDB import)',
      `-- Generated at: ${new Date().toISOString()}`,
      '',
      userInserts,
      '',
      eventInserts,
      '',
      participantInserts,
    ].join('\n')

    const outputPath = './seed_data_tmp/seed.sql'
    fs.mkdirSync('./seed_data_tmp', { recursive: true })
    fs.writeFileSync(outputPath, sqlContent, 'utf-8')

    console.log(`Generated SQL file: ${outputPath}`)
    console.log(
      `To execute: npx wrangler d1 execute <DB_NAME> --remote --file=${outputPath} -c <your-wrangler.jsonc>`,
    )
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

main()
