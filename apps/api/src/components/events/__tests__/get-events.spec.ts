import { env as testEnv } from 'cloudflare:test'
import {
  type EventList,
  ISODateSchema,
  ISOTimeSchema,
} from '@downtown65/schema'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDatabase,
  createTestEvent,
  createTestUser,
  seedTestDatabase,
} from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import app from '~/server'

describe('GET /events', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
  })

  it('returns empty array when no events exist', async () => {
    const res = await authenticatedRequest(app, testEnv, '/events', 'GET')

    expect(res.status).toBe(200)
    const events = await res.json<EventList>()
    expect(events).toEqual([])
  })

  it('returns list of future events', async () => {
    const user = await createTestUser(db)

    // Create a future event
    await createTestEvent(db, {
      creatorId: user.id,
      dateStart: ISODateSchema.parse('2027-12-01'),
      timeStart: ISOTimeSchema.parse('18:00'),
      title: 'Future Event',
    })

    // Create a past event (should not be returned)
    await createTestEvent(db, {
      creatorId: user.id,
      dateStart: ISODateSchema.parse('2020-01-01'),
      title: 'Past Event',
    })

    const res = await authenticatedRequest(app, testEnv, '/events', 'GET')

    expect(res.status).toBe(200)
    const events = await res.json<EventList>()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      dateStart: '2027-12-01',
      title: 'Future Event',
    })
  })

  it('includes event creator and participants', async () => {
    await seedTestDatabase(db, {
      eventCount: 1,
      participationsPerEvent: 2,
      userCount: 3,
    })

    const res = await authenticatedRequest(app, testEnv, '/events', 'GET')

    expect(res.status).toBe(200)
    const responseEvents = await res.json<EventList>()
    expect(responseEvents).toHaveLength(1)

    const event = responseEvents[0]
    expect(event.createdBy).toMatchObject({
      id: expect.any(Number),
      nickname: expect.any(String),
      picture: expect.any(String),
    })
    expect(event.participants).toHaveLength(2)
    expect(event.participants[0]).toMatchObject({
      id: expect.any(Number),
      joinedAt: expect.any(String),
      nickname: expect.any(String),
    })
  })

  it('orders events by date and time', async () => {
    const user = await createTestUser(db)

    await createTestEvent(db, {
      creatorId: user.id,
      dateStart: ISODateSchema.parse('2027-12-15'),
      timeStart: ISOTimeSchema.parse('20:00'),
      title: 'Event 3',
    })
    await createTestEvent(db, {
      creatorId: user.id,
      dateStart: ISODateSchema.parse('2027-12-01'),
      timeStart: ISOTimeSchema.parse('18:00'),
      title: 'Event 1',
    })
    await createTestEvent(db, {
      creatorId: user.id,
      dateStart: ISODateSchema.parse('2027-12-01'),
      timeStart: ISOTimeSchema.parse('20:00'),
      title: 'Event 2',
    })

    const res = await authenticatedRequest(app, testEnv, '/events', 'GET')

    expect(res.status).toBe(200)
    const events = await res.json<EventList>()
    expect(events).toHaveLength(3)
    expect(events[0].title).toBe('Event 1')
    expect(events[1].title).toBe('Event 2')
    expect(events[2].title).toBe('Event 3')
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request('/events', { method: 'GET' }, testEnv)

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/events',
        {
          headers: { 'x-api-key': testEnv.API_KEY },
          method: 'GET',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
