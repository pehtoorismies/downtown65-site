import { EVENT_TYPES } from '@downtown65/schema'
import { sql } from 'drizzle-orm/sql/sql'
import { index, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable(
  'events',
  (t) => ({
    id: t.integer().primaryKey({ autoIncrement: true }),
    eventULID: t.text().notNull().unique(),
    title: t.text().notNull(),
    subtitle: t.text().notNull(),
    description: t.text().default(''),
    eventType: t.text({ enum: EVENT_TYPES }).notNull(),
    dateStart: t.text().notNull(),
    timeStart: t.text(),
    location: t.text().notNull(),
    race: t.integer({ mode: 'boolean' }).notNull().default(false),
    createdAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
    creatorId: t.integer().notNull(),
  }),
  (table) => [index('events_eventULID_idx').on(table.eventULID)],
)

export const users = sqliteTable(
  'users',
  (t) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    auth0Sub: t.text().notNull().unique(), // Link to Auth0
    nickname: t.text().notNull().unique(),
    picture: t.text().notNull(),
  }),
  (table) => [index('users_auth0Sub_idx').on(table.auth0Sub)],
)

export const usersToEvent = sqliteTable(
  'users_to_events',
  (t) => ({
    userId: t
      .integer()
      .notNull()
      .references(() => users.id),
    eventId: t
      .integer()
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    createdAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
  }),
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })],
)
