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
import app from '~/server'

/**
 * The JWT mock (jwk-mock.ts) uses 'auth0|user-123' as the sub for authenticated requests.
 * The endpoint resolves the requesting user from this sub to add their participation.
 */
const MOCK_JWT_AUTH0_SUB = 'auth0|user-123'

describe('POST /events/{id}/participants/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  describe('successful participation', () => {
    it('adds user as participant and returns success message', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'POST',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: `User with ID ${user.id} joined the event ${event.id} successfully`,
      })
    })

    it('creates participation record in database', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'POST',
      )

      const participation = await db.query.usersToEvent.findFirst({
        where: { eventId: event.id, userId: user.id },
      })
      expect(participation).toBeDefined()
      expect(participation?.eventId).toBe(event.id)
      expect(participation?.userId).toBe(user.id)
    })

    it('allows creator to join their own event', async () => {
      const creator = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}/participants/me`,
        'POST',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: `User with ID ${creator.id} joined the event ${event.id} successfully`,
      })
    })
  })

  describe('when user is already a participant', () => {
    it('returns 200 with already-joined message', async () => {
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
        'POST',
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        message: `User already joined event with ID ${event.id}`,
      })
    })

    it('does not create duplicate participation record', async () => {
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
        'POST',
      )

      const participations = await db.query.usersToEvent.findMany({
        where: { eventId: event.id, userId: user.id },
      })
      expect(participations).toHaveLength(1)
    })
  })

  describe('when event does not exist', () => {
    it('returns 404 for non-existent event', async () => {
      await createTestUser(db, { auth0Sub: MOCK_JWT_AUTH0_SUB })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events/999999/participants/me',
        'POST',
      )

      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({
        message: 'Event with ID 999999 not found',
      })
    })

    it('does not create participation record for non-existent event', async () => {
      const user = await createTestUser(db, {
        auth0Sub: MOCK_JWT_AUTH0_SUB,
      })

      await authenticatedRequest(
        app,
        testEnv,
        '/events/999999/participants/me',
        'POST',
      )

      const participations = await db.query.usersToEvent.findMany({
        where: { userId: user.id },
      })
      expect(participations).toHaveLength(0)
    })
  })

  describe('multiple events', () => {
    it('allows user to join multiple events', async () => {
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

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event1.id}/participants/me`,
        'POST',
      )
      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event2.id}/participants/me`,
        'POST',
      )

      const participations = await db.query.usersToEvent.findMany({
        where: { userId: user.id },
      })
      expect(participations).toHaveLength(2)
      expect(participations.map((p) => p.eventId).sort()).toEqual(
        [event1.id, event2.id].sort(),
      )
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
        { method: 'POST' },
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
          method: 'POST',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
