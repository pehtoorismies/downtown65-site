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

const generateEventInsertStatements = (events: ParsedEvent[]): string => {
  const statements: string[] = []

  statements.push('-- Event seed data (from DynamoDB import)')
  statements.push(`-- Generated at: ${new Date().toISOString()}`)
  statements.push(`-- Total events: ${events.length}`)
  statements.push(
    '-- NOTE: creatorId is set to 1 (placeholder). Original creator info in comments.',
  )
  statements.push('')

  const uniqueCreators = new Set<string>()

  for (const event of events) {
    uniqueCreators.add(`${event.createdBy.id} (${event.createdBy.nickname})`)

    const values = [
      `'${escapeSQL(event.eventULID)}'`,
      `'${escapeSQL(event.title)}'`,
      `'${escapeSQL(event.subtitle)}'`,
      event.description ? `'${escapeSQL(event.description)}'` : "''",
      `'${event.eventType}'`,
      `'${event.dateStart}'`,
      event.timeStart ? `'${event.timeStart}'` : 'NULL',
      `'${escapeSQL(event.location)}'`,
      event.race ? '1' : '0',
      `'${event.createdAt}'`,
      `'${event.updatedAt}'`,
      '1',
    ]

    statements.push(
      `-- creator: ${event.createdBy.nickname} (${event.createdBy.id})`,
    )
    statements.push(
      `INSERT INTO events (eventULID, title, subtitle, description, eventType, dateStart, timeStart, location, race, createdAt, updatedAt, creatorId) VALUES (${values.join(', ')});`,
    )
  }

  statements.push('')
  statements.push(`-- Unique event creators (${uniqueCreators.size} total):`)
  for (const creator of [...uniqueCreators].sort()) {
    statements.push(`--   ${creator}`)
  }

  return statements.join('\n')
}

const main = async () => {
  try {
    const events = await readEventsFromImportDir('.import')

    console.log(`Parsed ${events.length} events`)
    if (events.length > 0) {
      console.log(
        `Date range: ${events[0].createdAt} to ${events[events.length - 1].createdAt}`,
      )
    }

    const sqlContent = generateEventInsertStatements(events)

    const outputPath = './seed-data/seed-events.sql'
    fs.mkdirSync('./seed-data', { recursive: true })
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
