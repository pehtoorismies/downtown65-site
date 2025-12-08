import { index, sqliteTable } from 'drizzle-orm/sqlite-core'

export const eventsTable = sqliteTable(
  'events_table',
  (t) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    sub: t.text().notNull().unique(),
    title: t.text().notNull(),
    subtitle: t.text().notNull(),
    description: t.text().default(''),
    type: t.text().notNull(),
    date: t.text().notNull(),
    time: t.text().notNull(),
    location: t.text().notNull(),
    race: t.integer({ mode: 'boolean' }).notNull().default(false),
  }),
  (table) => [index('events_sub_idx').on(table.sub)],
)

// export const eventsTable = sqliteTable(
//   'events_table',
//   {
//     id: int().primaryKey({ autoIncrement: true }),
//     sub: text().notNull().unique(),
//     name: text().notNull(),
//     age: int().notNull(),
//     email: text().notNull().unique(),
//   },
//   (table) => ({
//     subIdx: index('events_sub_idx').on(table.sub),
//     // If sub must be unique:
//     // subUnique: uniqueIndex("events_sub_unique").on(table.sub),
//   }),
// )
