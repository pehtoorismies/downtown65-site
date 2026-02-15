import { EVENT_TYPES } from '@downtown65/schema'
import { sql } from 'drizzle-orm/sql/sql'
import { index, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable(
  'events',
  (t) => ({
    createdAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
    creatorId: t.integer().notNull(),
    dateStart: t.text().notNull(),
    description: t.text().default(''),
    eventType: t.text({ enum: EVENT_TYPES }).notNull(),
    eventULID: t.text().notNull().unique(),
    id: t.integer().primaryKey({ autoIncrement: true }),
    location: t.text().notNull(),
    race: t.integer({ mode: 'boolean' }).notNull().default(false),
    subtitle: t.text().notNull(),
    timeStart: t.text(),
    title: t.text().notNull(),
    updatedAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
  }),
  (table) => [index('events_eventULID_idx').on(table.eventULID)],
)

export const users = sqliteTable(
  'users',
  (t) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    nickname: t.text().notNull().unique(),
    picture: t.text().notNull(),
    sub: t.text().notNull().unique(), // Link to UserService like Auth0 sub
  }),
  (table) => [index('users_sub_idx').on(table.sub)],
)

export const usersToEvent = sqliteTable(
  'users_to_events',
  (t) => ({
    createdAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
    eventId: t
      .integer()
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id),
  }),
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })],
)
