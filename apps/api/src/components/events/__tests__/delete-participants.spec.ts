import { env as testEnv } from 'cloudflare:test'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDatabase,
  createTestEvent,
  createTestParticipation,
  createTestUser,
} from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { usersToEvent } from '~/db/schema'
import app from '~/server'

/**
 * The JWT mock (jwk-mock.ts) uses 'auth0|user-123' as the sub for authenticated requests.
 * The endpoint resolves the requesting user from this sub to find their participation.
 */
const MOCK_JWT_AUTH0_SUB = 'auth0|user-123'

describe('DELETE /events/{id}/participants/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  describe('successful removal', () => {
    it('removes participation and returns success message', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })
      await createTestParticipation(db, user.id, event.id)

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'DELETE',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: `User left the event ${event.id} successfully`,
      })
    })

    it('removes participation record from database', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })
      await createTestParticipation(db, user.id, event.id)

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'DELETE',
      )

      const participation = await db.query.usersToEvent.findFirst({
        where: {
          eventId: event.id,
          userId: user.id,
        },
      })
      expect(participation).toBeUndefined()
    })

    it('does not affect other participants when one leaves', async () => {
      const leavingUser = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
        nickname: 'leaving',
      })
      const stayingUser = await createTestUser(db, { nickname: 'staying' })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })
      await createTestParticipation(db, leavingUser.id, event.id)
      await createTestParticipation(db, stayingUser.id, event.id)

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'DELETE',
      )

      const remaining = await db
        .select()
        .from(usersToEvent)
        .where(eq(usersToEvent.eventId, event.id))
      expect(remaining).toHaveLength(1)
      expect(remaining[0].userId).toBe(stayingUser.id)
    })

    it('does not affect participation in other events', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event1 = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event 1',
      })
      const event2 = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Event 2',
      })
      await createTestParticipation(db, user.id, event1.id)
      await createTestParticipation(db, user.id, event2.id)

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event1.id}/participants/me`,
        'DELETE',
      )

      const remaining = await db.query.usersToEvent.findFirst({
        where: {
          eventId: event2.id,
          userId: user.id,
        },
      })

      expect(remaining).toBeDefined()
    })
  })

  describe('when user is not a participant', () => {
    it('returns 200 with not-registered message for existing event', async () => {
      await createTestUser(db, { auth0Sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'DELETE',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: `User was not registered for event ${event.id}`,
      })
    })

    it('returns 200 with not-registered message for non-existent event', async () => {
      await createTestUser(db, { auth0Sub: MOCK_JWT_AUTH0_SUB })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events/999999/participants/me',
        'DELETE',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: 'User was not registered for event 999999',
      })
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await app.request(
        `/events/${event.id}/participants/me`,
        { method: 'DELETE' },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await app.request(
        `/events/${event.id}/participants/me`,
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
