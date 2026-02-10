import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDatabase,
  createTestEvent,
  createTestParticipation,
  createTestUser,
} from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { events } from '~/db/schema'
import app from '~/server'

/**
 * The JWT mock (jwk-mock.ts) uses 'auth0|user-123' as the sub for authenticated requests.
 * To test authorization, we need to create users with matching auth0Sub values.
 */
const MOCK_JWT_AUTH0_SUB = 'auth0|user-123'

describe('DELETE /events/{id}', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  describe('when event does not exist', () => {
    it('returns 404 for non-existent event', async () => {
      // Create a user that matches the JWT mock so authentication succeeds
      await createTestUser(db, { auth0Sub: MOCK_JWT_AUTH0_SUB })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events/999999',
        'DELETE',
      )

      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({ code: 404, message: 'Event not found' })
    })
  })

  describe('authorization', () => {
    it('returns 403 when user is not the event creator', async () => {
      // Create the authenticated user (matches JWT mock)
      await createTestUser(db, { auth0Sub: MOCK_JWT_AUTH0_SUB })

      // Create a different user who owns the event
      const eventCreator = await createTestUser(db, {
        auth0Sub: 'auth0|other-user',
        nickname: 'eventowner',
      })
      const event = await createTestEvent(db, {
        creatorId: eventCreator.id,
        title: 'Not My Event',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'DELETE',
      )

      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body).toEqual({
        code: 403,
        message: 'Only event creator can delete event',
      })
    })

    it('returns 403 when authenticated user does not exist in database', async () => {
      // Create a different user who owns the event (not matching JWT mock)
      const eventCreator = await createTestUser(db, {
        auth0Sub: 'auth0|other-user',
      })
      const event = await createTestEvent(db, { creatorId: eventCreator.id })

      // Don't create a user with MOCK_JWT_AUTH0_SUB - getUserId will return undefined

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'DELETE',
      )

      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body).toEqual({
        code: 403,
        message: 'Only event creator can delete event',
      })
    })
  })

  describe('successful deletion', () => {
    it('deletes event when user is the creator', async () => {
      // Create user that matches the JWT mock
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
        nickname: 'creator',
      })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event To Delete',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'DELETE',
      )

      expect(res.status).toBe(204)

      // Verify event is deleted from database
      const deletedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      expect(deletedEvent).toBeUndefined()
    })

    it('returns empty body on successful deletion', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'DELETE',
      )

      expect(res.status).toBe(204)
      const body = await res.text()
      expect(body).toBe('')
    })

    it('deletes event with participants', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const participant1 = await createTestUser(db, {
        nickname: 'participant1',
      })
      const participant2 = await createTestUser(db, {
        nickname: 'participant2',
      })

      const event = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event With Participants',
      })
      await createTestParticipation(db, participant1.id, event.id)
      await createTestParticipation(db, participant2.id, event.id)

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'DELETE',
      )

      expect(res.status).toBe(204)

      // Verify event is deleted
      const deletedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      expect(deletedEvent).toBeUndefined()
    })

    it('does not affect other events when deleting one', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const eventToDelete = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event To Delete',
      })
      const eventToKeep = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event To Keep',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${eventToDelete.id}`,
        'DELETE',
      )

      expect(res.status).toBe(204)

      // Verify only the target event is deleted
      const allEvents = await db.select().from(events)
      expect(allEvents).toHaveLength(1)
      expect(allEvents[0].id).toBe(eventToKeep.id)
      expect(allEvents[0].title).toBe('Event To Keep')
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await app.request(
        `/events/${event.id}`,
        { method: 'DELETE' },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await app.request(
        `/events/${event.id}`,
        {
          headers: { 'x-api-key': testEnv.API_KEY },
          method: 'DELETE',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
