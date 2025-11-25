import { nanoid } from 'nanoid'
import type { Event, EventCreateInput, EventUpdateInput } from '../schemas/event'

export class EventStore {
  private events = new Map<string, Event>()

  list(): Event[] {
    return Array.from(this.events.values())
  }

  get(id: string): Event | undefined {
    return this.events.get(id)
  }

  create(input: EventCreateInput): Event {
    const event: Event = { id: `evt_${nanoid(10)}`, ...input }
    this.events.set(event.id, event)
    return event
  }

  update(id: string, patch: EventUpdateInput): Event | undefined {
    const existing = this.events.get(id)
    if (!existing) {
      return undefined
    }
    const updated: Event = { ...existing, ...patch, id }
    this.events.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.events.delete(id)
  }

  clear(): void {
    this.events.clear()
  }
}

export const eventStore = new EventStore()
