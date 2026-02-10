import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  events: {
    createdBy: r.one.users({
      from: r.events.creatorId,
      optional: false,
      to: r.users.id,
    }),
    participants: r.many.users({
      from: r.events.id.through(r.usersToEvent.eventId),
      to: r.users.id.through(r.usersToEvent.userId),
    }),
  },
  users: {
    participation: r.many.events({
      from: r.users.id.through(r.usersToEvent.userId),
      to: r.events.id.through(r.usersToEvent.eventId),
    }),
  },
}))

// // // Relations helpers (optional but recommended for type-safe joins)
// export const usersRelations = relations(usersTable, ({ many }) => ({
//   events: many(eventsTable), // User has many Events
// }))

// export const eventsRelations = relations(eventsTable, ({ one }) => ({
//   creator: one(usersTable, {
//     fields: [eventsTable.id],
//     references: [usersTable.id], // Event belongs to a User
//   }),
// }))
