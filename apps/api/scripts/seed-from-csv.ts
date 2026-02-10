/** biome-ignore-all lint/suspicious/noConsole: script */
import fs from 'node:fs'
import { EventTypeEnum, ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import { parse } from 'csv-parse/sync'
import z from 'zod'

const DynamoString = z.object({
  S: z.string(),
})

const DynamoUrl = z.object({
  S: z.url(),
})

const DynamoISODateTime = z.object({
  S: z.iso.datetime({ local: true }),
})

export const DynamoEventSchema = z
  .object({
    _ct: z.iso.datetime(),
    _md: z.iso.datetime(),
    createdBy: z.preprocess(
      (val) => JSON.parse(val as string),
      z
        .object({
          id: DynamoString,
          nickname: DynamoString,
          picture: DynamoString,
        })
        .transform((obj) => ({
          id: obj.id.S,
          nickname: obj.nickname.S,
          picture: obj.picture.S,
        })),
    ),
    dateStart: ISODateSchema,
    description: z.union([z.literal(''), z.string()]).transform((val) => {
      if (val === '') return null
      return val
    }),
    eventId: z.ulid(),
    location: z.string(),
    participants: z.preprocess(
      (val) => JSON.parse(val as string),
      z.record(
        z.string(),
        z.object({
          M: z.object({
            id: DynamoString,
            joinedAt: DynamoISODateTime,
            nickname: DynamoString,
            picture: DynamoUrl,
          }),
        }),
      ),
    ),
    race: z.stringbool(),
    subtitle: z.string(),
    timeStart: z.union([z.literal(''), ISOTimeSchema]).transform((val) => {
      if (val === '') return null
      return val
    }),
    title: z.string().trim().min(1),
    type: EventTypeEnum,
  })
  .transform((obj) => {
    const { _ct, _md, ...rest } = obj

    return {
      ...rest,
      createdAt: _ct,
      updatedAt: _md,
    }
  })

const readEvents = (fileName: string) => {
  const eventsCsv = fs.readFileSync(fileName, 'utf-8')
  const eventsData = parse(eventsCsv, {
    columns: true,
    skip_empty_lines: true,
  })

  const result = z.array(DynamoEventSchema).safeParse(eventsData)

  if (!result.success) {
    console.error(result.error.issues)
    throw new Error('Failed to parse events CSV')
  }

  return result.data.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

const readUsers = (fileName: string) => {
  const usersSemiJson = fs.readFileSync(`${fileName}`, 'utf-8')

  const usersData = usersSemiJson.split('\n')
  const users = usersData
    .map((line) => {
      try {
        return z
          .object({
            'Created At': z.iso.datetime(),
            Id: z.string(),
            Nickname: z.string(),
            Picture: z.string(),
          })
          .transform((obj) => ({
            auth0Sub: obj.Id,
            createdAt: obj['Created At'],
            nickname: obj.Nickname,
            picture: obj.Picture,
          }))
          .parse(JSON.parse(line))
      } catch {
        return null
      }
    })
    .filter((obj) => obj !== null)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    .map((obj, index) => ({
      ...obj,
      id: index + 1,
    }))

  return users
}

const escapeSQL = (value: string): string => {
  return value.replace(/'/g, "''")
}

const generateEventInsertStatements = (
  events: z.infer<typeof DynamoEventSchema>[],
  users: Array<{
    id: number
    auth0Sub: string
    nickname: string
    picture: string
  }>,
): string => {
  const userIdMap = new Map(users.map((u) => [u.auth0Sub, u.id]))

  const statements: string[] = []

  // Add header comment
  statements.push('-- Event seed data')
  statements.push(`-- Generated at: ${new Date().toISOString()}`)
  statements.push(`-- Total events: ${events.length}`)
  statements.push('')

  for (const event of events) {
    const creatorId = userIdMap.get(event.createdBy.id)

    if (!creatorId) {
      console.warn(
        `⚠ Skipping event "${event.title}" - creator "${event.createdBy.id}" not found`,
      )
      continue
    }

    const values = [
      `'${escapeSQL(event.eventId)}'`, // eventULID
      `'${escapeSQL(event.title)}'`, // title
      `'${escapeSQL(event.subtitle)}'`, // subtitle
      event.description ? `'${escapeSQL(event.description)}'` : 'NULL', // description
      `'${event.type}'`, // eventType
      `'${event.dateStart}'`, // dateStart
      event.timeStart ? `'${event.timeStart}'` : 'NULL', // timeStart
      `'${escapeSQL(event.location)}'`, // location
      event.race ? '1' : '0', // race (boolean as integer)
      `'${event.createdAt}'`, // createdAt
      `'${event.updatedAt}'`, // updatedAt
      creatorId.toString(), // creatorId
    ]

    statements.push(
      `INSERT INTO events (eventULID, title, subtitle, description, eventType, dateStart, timeStart, location, race, createdAt, updatedAt, creatorId) VALUES (${values.join(', ')});`,
    )
  }

  return statements.join('\n')
}

const generateUserInsertStatements = (
  users: Array<{
    id: number
    auth0Sub: string
    nickname: string
    picture: string
  }>,
): string => {
  const statements: string[] = []

  statements.push('-- User seed data')
  statements.push(`-- Generated at: ${new Date().toISOString()}`)
  statements.push(`-- Total users: ${users.length}`)
  statements.push('')

  for (const user of users) {
    const values = [
      `'${escapeSQL(user.auth0Sub)}'`, // auth0Sub
      `'${escapeSQL(user.nickname)}'`, // nickname
      `'${escapeSQL(user.picture)}'`, // picture
    ]

    statements.push(
      `INSERT INTO users (auth0Sub, nickname, picture) VALUES (${values.join(', ')});`,
    )
  }

  return statements.join('\n')
}

const main = () => {
  // Load CSV files
  try {
    const events = readEvents(`./seed-data/dynamo-events.csv`)
    const users = readUsers(`./seed-data/dev-dt65.json`)
    console.log(`✅ Parsed ${events.length} events`)
    console.log(`✅ Users ${users.length} users`)

    // Generate SQL insert statements
    const userInserts = generateUserInsertStatements(users)
    const eventInserts = generateEventInsertStatements(events, users)

    // console.log(eventInserts)

    // Combine all statements
    const sqlContent = [
      '-- Database seed data',
      `-- Generated at: ${new Date().toISOString()}`,
      '',
      userInserts,
      '',
      eventInserts,
    ].join('\n')

    // // Write to file
    const outputPath = './seed-data/seed-data.sql'
    fs.writeFileSync(outputPath, sqlContent, 'utf-8')

    console.log(`✅ Generated SQL file: ${outputPath}`)
    console.log(
      `📝 To execute: npx wrangler d1 execute <DB_NAME>--local --file=${outputPath} -c  wrangler.local.jsonc`,
    )
  } catch (err) {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  }
}

main()
