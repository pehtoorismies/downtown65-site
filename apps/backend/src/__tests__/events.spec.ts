import { OpenAPIHono } from '@hono/zod-openapi'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AppAPI } from '../app-api'
import { registerEventRoutes } from '../routes/eventsRoutes'
import { EventStore } from '../store/eventsStore'

const sampleEvent = {
  title: 'Sample',
  subtitle: 'Kick-off',
  date: '2025-11-15',
  time: '09:00',
  type: 'meeting',
  description: 'Project intro',
  location: 'Room 1',
  participants: [
    { id: 'usr_1', name: 'Alice', nickname: 'ali' },
    { id: 'usr_2', name: 'Bob', nickname: 'bobby' },
  ],
}

describe('EventStore', () => {
  it('creates, updates, and deletes events', () => {
    const store = new EventStore()
    const created = store.create(sampleEvent)
    expect(created.id).toMatch(/^evt_/)
    expect(store.list()).toHaveLength(1)

    const updated = store.update(created.id, { title: 'Updated' })
    expect(updated?.title).toBe('Updated')

    const removed = store.delete(created.id)
    expect(removed).toBe(true)
    expect(store.list()).toHaveLength(0)
  })
})

describe('Event routes', () => {
  let store: EventStore
  let app: AppAPI

  beforeEach(() => {
    store = new EventStore()
    app = new OpenAPIHono()
    registerEventRoutes(app, store)
  })

  it('creates and lists events via HTTP', async () => {
    const createRes = await app.request('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleEvent),
    })
    expect(createRes.status).toBe(201)
    const created = (await createRes.json()) as { id: string }

    const listRes = await app.request('/events')
    expect(listRes.status).toBe(200)
    const events = (await listRes.json()) as Array<{ id: string }>
    expect(events).toHaveLength(1)
    expect(events[0].id).toBe(created.id)
  })

  it('returns 404 for missing event', async () => {
    const res = await app.request('/events/missing')
    expect(res.status).toBe(404)
  })
})
