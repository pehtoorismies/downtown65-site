import { sql } from 'drizzle-orm/sql/sql'
import { index, sqliteTable } from 'drizzle-orm/sqlite-core'

export const eventsTable = sqliteTable(
  'events_table',
  (t) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    eventULID: t.text().notNull().unique(),
    title: t.text().notNull(),
    subtitle: t.text().notNull(),
    description: t.text().default(''),
    type: t.text().notNull(),
    date: t.text().notNull(),
    time: t.text().notNull(),
    location: t.text().notNull(),
    race: t.integer({ mode: 'boolean' }).notNull().default(false),
    createdAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t.text().notNull().default(sql`CURRENT_TIMESTAMP`),
  }),
  (table) => [index('events_eventULID_idx').on(table.eventULID)],
)

export const usersTable = sqliteTable(
  'users_table',
  (t) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    auth0Sub: t.text().notNull().unique(), // Link to Auth0
    email: t.text().notNull().unique(),
    nickname: t.text().notNull().unique(),
    name: t.text(),
    picture: t.text(),
    createdAt: t.text().notNull(),
    updatedAt: t.text().notNull(),
  }),
  (table) => [index('users_auth0Sub_idx').on(table.auth0Sub)],
)
