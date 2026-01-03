import type { EventType, ParticipantList } from '@downtown65/schema'
import type { StepNumber } from './reducer'

export interface EventState {
  eventType?: EventType
  title: string
  subtitle: string
  location: string
  isRace: boolean
  date: Date
  activeStep: StepNumber
  time: {
    hours?: number
    minutes?: number
  }
  description: string
  participants: ParticipantList
  submitEvent: boolean
  kind: 'edit' | 'create'
}
