import { env as testEnv } from 'cloudflare:test'
import {
  type EventUpdateInput,
  ISODateSchema,
  ISOTimeSchema,
} from '@downtown65/schema'
import { assert, beforeEach, describe, expect, it } from 'vitest'
import {
  clearDatabase,
  createTestEvent,
  createTestUser,
} from '~/common/test/db-helpers'
import { createMockUserService } from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const app = createApp({ userService: createMockUserService() })

/**
 * The JWT mock (jwk-mock.ts) uses 'auth0|user-123' as the sub for authenticated requests.
 */
const MOCK_JWT_AUTH0_SUB = 'auth0|user-123'

describe('PUT /events/{id}', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  describe('successful event update', () => {
    it('updates event title and returns success message', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Original Title',
      })

      const updateData: EventUpdateInput = {
        title: 'Updated Title',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ message: 'Event updated successfully' })
    })

    it('updates event in database', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        title: 'Original Title',
      })

      const updateData: EventUpdateInput = {
        title: 'Updated Title',
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.title).toBe('Updated Title')
    })

    it('updates multiple fields at once', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        description: 'Old description',
        location: 'Old location',
        title: 'Original Title',
      })

      const updateData: EventUpdateInput = {
        description: 'New description',
        location: 'New location',
        title: 'New Title',
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.title).toBe('New Title')
      expect(updatedEvent.description).toBe('New description')
      expect(updatedEvent.location).toBe('New location')
    })

    it('updates only specified fields, leaving others unchanged', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        description: 'Original description',
        location: 'Original location',
        title: 'Original Title',
      })

      const updateData: EventUpdateInput = {
        title: 'Updated Title',
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.title).toBe('Updated Title')
      expect(updatedEvent.description).toBe('Original description')
      expect(updatedEvent.location).toBe('Original location')
    })

    it('updates event date and time', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        dateStart: ISODateSchema.parse('2027-06-01'),
        timeStart: ISOTimeSchema.parse('10:00'),
      })

      const updateData: EventUpdateInput = {
        dateStart: ISODateSchema.parse('2027-07-15'),
        timeStart: ISOTimeSchema.parse('14:30'),
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.dateStart).toBe('2027-07-15')
      expect(updatedEvent.timeStart).toBe('14:30')
    })

    it('updates event type', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        eventType: 'RUNNING',
      })

      const updateData: EventUpdateInput = {
        eventType: 'CYCLING',
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.eventType).toBe('CYCLING')
    })

    it('updates description to null', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        description: 'Some description',
      })

      const updateData: EventUpdateInput = {
        description: null,
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.description).toBeNull()
    })

    it('updates timeStart to null', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, {
        creatorId: creator.id,
        timeStart: ISOTimeSchema.parse('10:00'),
      })

      const updateData: EventUpdateInput = {
        timeStart: null,
      }

      await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      const updatedEvent = await db.query.events.findFirst({
        where: { id: event.id },
      })
      assert(updatedEvent)
      expect(updatedEvent.timeStart).toBeNull()
    })
  })

  describe('when event does not exist', () => {
    it('returns 404 for non-existent event', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const updateData: EventUpdateInput = {
        title: 'Updated Title',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events/999999',
        'PUT',
        updateData,
      )

      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({ message: 'Event not found' })
    })
  })

  describe('validation', () => {
    it('returns 422 when no fields provided', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const updateData = {}

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      expect(res.status).toBe(422)
    })

    it('returns 422 when title is empty string', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const updateData: EventUpdateInput = {
        title: '',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      expect(res.status).toBe(422)
    })

    it('returns 422 when location is empty string', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const updateData: EventUpdateInput = {
        location: '',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      expect(res.status).toBe(422)
    })

    it('returns 422 when subtitle is empty string', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const updateData: EventUpdateInput = {
        subtitle: '',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'PUT',
        updateData,
      )

      expect(res.status).toBe(422)
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const res = await app.request(
        `/events/${event.id}`,
        { method: 'PUT' },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })
      const creator = await createTestUser(db, { nickname: 'creator' })
      const event = await createTestEvent(db, { creatorId: creator.id })

      const updateData: EventUpdateInput = {
        title: 'Updated Title',
      }

      const res = await app.request(
        `/events/${event.id}`,
        {
          body: JSON.stringify(updateData),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': testEnv.API_KEY,
          },
          method: 'PUT',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
