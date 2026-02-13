import { env as testEnv } from 'cloudflare:test'
import { type Event, ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDatabase,
  createTestEvent,
  createTestParticipation,
  createTestUser,
} from '~/common/test/db-helpers'
import {
  authenticatedRequest,
  makeRequest,
} from '~/common/test/request-helpers'
import type { HttpMethod } from '~/common/test/types'
import { getDb } from '~/db/get-db'
import { events } from '~/db/schema'
import app from '~/server'

/**
 * Makes a request with API key only (no JWT token).
 * The get-event endpoint allows anonymous JWT access but still requires API key.
 */
function apiKeyOnlyRequest(
  path: string,
  method: HttpMethod,
): Promise<Response> {
  return makeRequest(app, testEnv, path, {
    headers: {
      'x-api-key': testEnv.API_KEY,
    },
    method,
  })
}

describe('GET /events/{idOrULID}', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  describe('when event does not exist', () => {
    it('returns 404 for non-existent numeric id', async () => {
      const res = await authenticatedRequest(
        app,
        testEnv,
        '/events/999999',
        'GET',
      )
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({ message: 'Event with id 999999 not found' })
    })
    it('returns 404 for non-existent ULID', async () => {
      const nonExistentULID = '01KGQB74XVBEBXXT2H8VW2BSD1'
      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${nonExistentULID}`,
        'GET',
      )
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({
        message: `Event with id ${nonExistentULID} not found`,
      })
    })
  })

  describe('when event exists', () => {
    it('returns event by numeric id', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, {
        creatorId: user.id,
        dateStart: ISODateSchema.parse('2027-06-15'),
        eventType: 'MEETING',
        location: 'Helsinki',
        race: false,
        subtitle: 'A great summer event',
        timeStart: ISOTimeSchema.parse('14:30'),
        title: 'Summer Event',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body).toMatchObject({
        dateStart: '2027-06-15',
        eventType: 'MEETING',
        eventULID: event.eventULID,
        id: event.id,
        location: 'Helsinki',
        race: false,
        subtitle: 'A great summer event',
        timeStart: '14:30',
        title: 'Summer Event',
      })
    })

    it('returns event by ULID', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, {
        creatorId: user.id,
        title: 'ULID Event',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.eventULID}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.id).toBe(event.id)
      expect(body.eventULID).toBe(event.eventULID)
      expect(body.title).toBe('ULID Event')
    })

    it('includes creator information', async () => {
      const user = await createTestUser(db, {
        nickname: 'eventcreator',
        picture: 'https://example.com/creator.jpg',
      })
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.createdBy).toMatchObject({
        id: user.id,
        nickname: 'eventcreator',
        picture: 'https://example.com/creator.jpg',
      })
    })

    it('includes participants list', async () => {
      const creator = await createTestUser(db, { nickname: 'creator' })
      const participant1 = await createTestUser(db, {
        nickname: 'participant1',
      })
      const participant2 = await createTestUser(db, {
        nickname: 'participant2',
      })

      const event = await createTestEvent(db, { creatorId: creator.id })
      await createTestParticipation(db, participant1.id, event.id)
      await createTestParticipation(db, participant2.id, event.id)

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.participants).toHaveLength(2)
      expect(body.participants).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: participant1.id,
            joinedAt: expect.any(String),
            nickname: 'participant1',
          }),
          expect.objectContaining({
            id: participant2.id,
            joinedAt: expect.any(String),
            nickname: 'participant2',
          }),
        ]),
      )
    })

    it('returns empty participants array when no participants', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.participants).toEqual([])
    })
  })

  describe('anonymous JWT access', () => {
    it('allows access with API key only (no JWT token)', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, {
        creatorId: user.id,
        title: 'Public Event',
      })

      const res = await apiKeyOnlyRequest(`/events/${event.id}`, 'GET')

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.title).toBe('Public Event')
    })

    it('returns 404 for non-existent event with API key only', async () => {
      const res = await apiKeyOnlyRequest('/events/999999', 'GET')

      expect(res.status).toBe(404)
    })
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await app.request(
        `/events/${event.id}`,
        { method: 'GET' },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('allows access with API key only (no JWT required for GET)', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, { creatorId: user.id })

      const res = await app.request(
        `/events/${event.id}`,
        {
          headers: { 'x-api-key': testEnv.API_KEY },
          method: 'GET',
        },
        testEnv,
      )

      expect(res.status).toBe(200)
    })
  })

  describe('event fields', () => {
    it('returns event with null timeStart', async () => {
      const user = await createTestUser(db)
      const [event] = await db
        .insert(events)
        .values({
          creatorId: user.id,
          dateStart: ISODateSchema.parse('2027-03-01'),
          description: 'No time event',
          eventType: 'KARONKKA',
          eventULID: '01KGQB74XZ1F0P7MTKJ17DW5M2',
          location: 'Somewhere',
          race: false,
          subtitle: 'Subtitle',
          timeStart: null,
          title: 'Event without time',
        })
        .returning()

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.timeStart).toBeNull()
      expect(body.title).toBe('Event without time')
    })

    it('returns event with null description', async () => {
      const user = await createTestUser(db)
      const [event] = await db
        .insert(events)
        .values({
          creatorId: user.id,
          dateStart: ISODateSchema.parse('2027-04-01'),
          description: null,
          eventType: 'MEETING',
          eventULID: '01KGQB74XZ0EXYS1FEH52RBWP4',
          location: 'Office',
          race: false,
          subtitle: 'Work meeting',
          timeStart: ISOTimeSchema.parse('09:00'),
          title: 'No description event',
        })
        .returning()

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.description).toBeNull()
    })

    it('returns race event correctly', async () => {
      const user = await createTestUser(db)
      const event = await createTestEvent(db, {
        creatorId: user.id,
        eventType: 'RUNNING',
        race: true,
        title: 'Marathon',
      })

      const res = await authenticatedRequest(
        app,
        testEnv,
        `/events/${event.id}`,
        'GET',
      )

      expect(res.status).toBe(200)
      const body = await res.json<Event>()
      expect(body.race).toBe(true)
      expect(body.eventType).toBe('RUNNING')
    })
  })
})
