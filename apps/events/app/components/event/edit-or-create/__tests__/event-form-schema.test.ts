import { ISODateSchema, ISOTimeSchema } from '@downtown65/schema'
import { describe, expect, it } from 'vitest'
import { type EventForm, EventFormSchema } from '../event-form-schema'

describe('eventFormSchema', () => {
  it('should encode event form data correctly', () => {
    const validData: EventForm = {
      dateStart: ISODateSchema.parse('2024-01-01'),
      description: null,
      eventType: 'MEETING',
      includeEventCreator: false,
      location: 'Test Location',
      race: false,
      subtitle: 'Test Subtitle',
      timeStart: null,
      title: 'Test Event',
    }

    const encoded = EventFormSchema.encode(validData)
    expect(encoded.race).toBe('false')
    expect(encoded.includeEventCreator).toBe('false')
    expect(encoded.dateStart).toBe('2024-01-01')
    expect(encoded.timeStart).toBe('')
    expect(encoded.description).toBe('')
    expect(encoded.title).toBe('Test Event')
  })

  it('should encode event form data correctly', () => {
    const validData: EventForm = {
      dateStart: ISODateSchema.parse('2024-01-01'),
      description: 'Some description',
      eventType: 'MEETING',
      includeEventCreator: true,
      location: 'Test Location',
      race: true,
      subtitle: 'Test Subtitle',
      timeStart: ISOTimeSchema.parse('10:30'),
      title: 'Test Event',
    }

    const encoded = EventFormSchema.encode(validData)
    expect(encoded.race).toBe('true')
    expect(encoded.includeEventCreator).toBe('true')
    expect(encoded.dateStart).toBe('2024-01-01')
    expect(encoded.timeStart).toBe('10:30')
    expect(encoded.description).toBe('Some description')
    expect(encoded.title).toBe('Test Event')
  })
})
