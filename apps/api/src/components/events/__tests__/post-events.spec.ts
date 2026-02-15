import { env as testEnv } from 'cloudflare:test'
import {
  type EventCreateInput,
  ISODateSchema,
  ISOTimeSchema,
} from '@downtown65/schema'
import { assert, beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import { createMockUserService } from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const app = createApp({ userService: createMockUserService() })

/**
 * The JWT mock (jwk-mock.ts) uses 'auth0|user-123' as the sub for authenticated requests.
 */
const MOCK_JWT_AUTH0_SUB = 'auth0|user-123'

describe('POST /events', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  const validEventData: EventCreateInput = {
    dateStart: ISODateSchema.parse('2027-06-15'),
    description: 'A summer running event',
    eventType: 'RUNNING',
    location: 'Central Park',
    race: false,
    subtitle: 'Join us for a fun run',
    timeStart: ISOTimeSchema.parse('09:00'),
    title: 'Summer Fun Run',
  }

  describe('successful event creation', () => {
    it('creates event and returns eventULID', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        validEventData,
      )

      expect(res.status).toBe(201)
      const body = await res.json<{ eventULID: string }>()
      expect(body.eventULID).toMatch(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/)
    })

    it('creates event in database with correct data', async () => {
      const creator = await createTestUser(db, {
        sub: MOCK_JWT_AUTH0_SUB,
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        validEventData,
      )

      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })

      expect(createdEvent).toBeDefined()
      expect(createdEvent).toMatchObject({
        creatorId: creator.id,
        dateStart: '2027-06-15',
        description: 'A summer running event',
        eventType: 'RUNNING',
        location: 'Central Park',
        race: false,
        subtitle: 'Join us for a fun run',
        timeStart: '09:00',
        title: 'Summer Fun Run',
      })
    })

    it('creates event with null description', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const eventData: EventCreateInput = {
        ...validEventData,
        description: null,
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      expect(res.status).toBe(201)
      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      expect(createdEvent?.description).toBeNull()
    })

    it('creates event with null timeStart', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const eventData: EventCreateInput = {
        ...validEventData,
        timeStart: null,
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      expect(res.status).toBe(201)
      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      expect(createdEvent?.timeStart).toBeNull()
    })

    it('creates race event', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const eventData: EventCreateInput = {
        ...validEventData,
        eventType: 'RUNNING',
        race: true,
        title: 'City Marathon',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      expect(res.status).toBe(201)
      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      expect(createdEvent?.race).toBe(true)
      expect(createdEvent?.eventType).toBe('RUNNING')
    })
  })

  describe('includeEventCreator flag', () => {
    it('does not add creator as participant when includeEventCreator is false', async () => {
      const creator = await createTestUser(db, {
        sub: MOCK_JWT_AUTH0_SUB,
      })

      const eventData: EventCreateInput = {
        ...validEventData,
        includeEventCreator: false,
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      assert(createdEvent)

      const participation = await db.query.usersToEvent.findFirst({
        where: { eventId: createdEvent.id, userId: creator.id },
      })
      expect(participation).toBeUndefined()
    })

    it('does not add creator as participant when includeEventCreator is omitted (defaults to false)', async () => {
      const creator = await createTestUser(db, {
        sub: MOCK_JWT_AUTH0_SUB,
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        validEventData,
      )

      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      assert(createdEvent)

      const participation = await db.query.usersToEvent.findFirst({
        where: { eventId: createdEvent.id, userId: creator.id },
      })
      expect(participation).toBeUndefined()
    })

    it('adds creator as participant when includeEventCreator is true', async () => {
      const creator = await createTestUser(db, {
        sub: MOCK_JWT_AUTH0_SUB,
      })

      const eventData: EventCreateInput = {
        ...validEventData,
        includeEventCreator: true,
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      assert(createdEvent)

      const participation = await db.query.usersToEvent.findFirst({
        where: { eventId: createdEvent.id, userId: creator.id },
      })
      assert(participation)
      expect(participation.eventId).toBe(createdEvent.id)
      expect(participation.userId).toBe(creator.id)
    })
  })

  describe('different event types', () => {
    it('creates KARONKKA event', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const eventData: EventCreateInput = {
        ...validEventData,
        eventType: 'KARONKKA',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      expect(res.status).toBe(201)
      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      expect(createdEvent?.eventType).toBe('KARONKKA')
    })

    it('creates CYCLING event', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const eventData: EventCreateInput = {
        ...validEventData,
        eventType: 'CYCLING',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        eventData,
      )

      expect(res.status).toBe(201)
      const { eventULID } = await res.json<{ eventULID: string }>()
      const createdEvent = await db.query.events.findFirst({
        where: { eventULID },
      })
      expect(createdEvent?.eventType).toBe('CYCLING')
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const res = await app.request('/events', { method: 'POST' }, testEnv)

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const res = await app.request(
        '/events',
        {
          body: JSON.stringify(validEventData),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': testEnv.API_KEY,
          },
          method: 'POST',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })

  describe('validation', () => {
    it('returns 422 when required fields are missing', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const invalidData = {
        title: 'Event without required fields',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        invalidData,
      )

      expect(res.status).toBe(422)
    })

    it('returns 422 when title is empty', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const invalidData: EventCreateInput = {
        ...validEventData,
        title: '',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        invalidData,
      )

      expect(res.status).toBe(422)
    })

    it('returns 422 when location is empty', async () => {
      await createTestUser(db, { sub: MOCK_JWT_AUTH0_SUB })

      const invalidData: EventCreateInput = {
        ...validEventData,
        location: '',
      }

      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events',
        'POST',
        invalidData,
      )

      expect(res.status).toBe(422)
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request(
        '/events',
        {
          body: JSON.stringify(validEventData),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/events',
        {
          body: JSON.stringify(validEventData),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': testEnv.API_KEY,
          },
          method: 'POST',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
