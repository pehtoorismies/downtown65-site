import {
  type EventType,
  type ISODate,
  ISODateSchema,
  type ISOTime,
  ISOTimeSchema,
} from '@downtown65/schema'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulidx'
import type { DB } from '~/db/get-db'
import { events, users, usersToEvent } from '~/db/schema'

export interface CreateUserOptions {
  auth0Sub?: string
  nickname?: string
  picture?: string
}

export interface CreateEventOptions {
  creatorId?: number
  eventULID?: string
  title?: string
  subtitle?: string
  description?: string
  eventType?: EventType
  dateStart?: ISODate
  timeStart?: ISOTime
  location?: string
  race?: boolean
}

export interface SeedOptions {
  userCount?: number
  eventCount?: number
  participationsPerEvent?: number
}

/**
 * Clears all data from test database tables.
 * Uses raw SQL since Drizzle delete without where clause has issues in test environment.
 */
export async function clearDatabase(db: DB): Promise<void> {
  // Delete in reverse dependency order to respect foreign key constraints
  await db.run(sql.raw('DELETE FROM users_to_events'))
  await db.run(sql.raw('DELETE FROM events'))
  await db.run(sql.raw('DELETE FROM users'))
}

/**
 * Creates a test user with default or provided values.
 */
export async function createTestUser(
  db: DB,
  options: CreateUserOptions = {},
): Promise<typeof users.$inferSelect> {
  const timestamp = Date.now()
  const auth0Sub = options.auth0Sub || `auth0|test-${timestamp}`
  const nickname = options.nickname || `testuser-${timestamp}`
  const picture =
    options.picture || `https://example.com/avatar-${timestamp}.jpg`

  const [created] = await db
    .insert(users)
    .values({
      auth0Sub,
      nickname,
      picture,
    })
    .returning()

  return created
}

/**
 * Creates a test event with default or provided values.
 */
export async function createTestEvent(
  db: DB,
  options: CreateEventOptions = {},
): Promise<typeof events.$inferSelect> {
  const timestamp = Date.now()

  // If no creatorId provided, create a user
  let creatorId = options.creatorId
  if (!creatorId) {
    const creator = await createTestUser(db)
    creatorId = creator.id
  }

  const [created] = await db
    .insert(events)
    .values({
      creatorId,
      dateStart: options.dateStart || ISODateSchema.parse('2027-12-31'),
      description: options.description || '',
      eventType: options.eventType || 'KARONKKA',
      eventULID: options.eventULID || ulid(),
      location: options.location || 'Test Location',
      race: options.race ?? false,
      subtitle: options.subtitle || `Test Subtitle ${timestamp}`,
      timeStart: options.timeStart || ISOTimeSchema.parse('18:00'),
      title: options.title || `Test Event ${timestamp}`,
    })
    .returning()

  return created
}

/**
 * Creates a participation record linking a user to an event.
 */
export async function createTestParticipation(
  db: DB,
  userId: number,
  eventId: number,
): Promise<void> {
  await db.insert(usersToEvent).values({
    eventId,
    userId,
  })
}

/**
 * Seeds the database with test data.
 * Returns created users and events for use in tests.
 */
export async function seedTestDatabase(
  db: DB,
  options: SeedOptions = {},
): Promise<{
  users: (typeof users.$inferSelect)[]
  events: (typeof events.$inferSelect)[]
}> {
  const { userCount = 5, eventCount = 3, participationsPerEvent = 2 } = options

  // Create users
  const createdUsers: (typeof users.$inferSelect)[] = []
  for (let i = 0; i < userCount; i++) {
    const u = await createTestUser(db, {
      nickname: `testuser-${i}`,
    })
    createdUsers.push(u)
  }

  // Create events
  const createdEvents: (typeof events.$inferSelect)[] = []
  for (let i = 0; i < eventCount; i++) {
    const e = await createTestEvent(db, {
      creatorId: createdUsers[0].id,
      dateStart: ISODateSchema.parse(
        `2027-${String(i + 1).padStart(2, '0')}-01`,
      ),
      title: `Test Event ${i}`,
    })
    createdEvents.push(e)

    // Add participants (skip creator who is at index 0)
    for (
      let j = 0;
      j < participationsPerEvent && j + 1 < createdUsers.length;
      j++
    ) {
      await createTestParticipation(db, createdUsers[j + 1].id, e.id)
    }
  }

  return { events: createdEvents, users: createdUsers }
}
