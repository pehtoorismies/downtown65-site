import {
  type EventType,
  ISODateTimeSchema,
  type User,
} from '@downtown65/schema'
import type { Dispatch } from 'react'
import type { EventState } from './event-state'

export const ActiveStep = {
  STEP_DATE: 2,
  STEP_DESCRIPTION: 4,
  STEP_EVENT_TYPE: 0,
  STEP_PREVIEW: 5,
  STEP_TIME: 3,
  STEP_TITLE: 1,
} as const

export type StepNumber = (typeof ActiveStep)[keyof typeof ActiveStep]

export const isStepNumber = (step: number): step is StepNumber => {
  return Object.values(ActiveStep).includes(step as StepNumber)
}

type InfoAction = {
  kind: 'info'
  title: string
  subtitle: string
  location: string
  activeStep: StepNumber
}

type TypeAction = {
  kind: 'eventType'
  eventType: EventType
}

type StepAction = {
  kind: 'step'
  step: StepNumber
}
type NextStepAction = {
  kind: 'nextStep'
}
type PreviousStepAction = {
  kind: 'previousStep'
}
type RaceAction = {
  kind: 'race'
  isRace: boolean
}
type DateAction = {
  kind: 'date'
  date: Date
}
type TimeAction = {
  kind: 'time'
  time: {
    minutes?: number
    hours?: number
  }
}
type DescriptionAction = {
  kind: 'description'
  description: string
}
type JoinEventAction = {
  kind: 'joinEvent'
  me: User
}
type LeaveEventAction = {
  kind: 'leaveEvent'
  me: User
}

export type EventAction =
  | DateAction
  | DescriptionAction
  | InfoAction
  | LeaveEventAction
  | NextStepAction
  | JoinEventAction
  | PreviousStepAction
  | RaceAction
  | StepAction
  | TimeAction
  | TypeAction

export interface ReducerProps {
  state: EventState
  dispatch: Dispatch<EventAction>
}

export const reducer = (state: EventState, action: EventAction): EventState => {
  switch (action.kind) {
    case 'eventType': {
      if (!state.eventType) {
        return {
          ...state,
          activeStep: ActiveStep.STEP_TITLE,
          eventType: action.eventType,
        }
      }
      return { ...state, eventType: action.eventType }
    }
    case 'info': {
      return {
        ...state,
        activeStep: action.activeStep,
        location: action.location,
        subtitle: action.subtitle,
        title: action.title,
      }
    }
    case 'step': {
      return { ...state, activeStep: action.step }
    }
    case 'nextStep': {
      return {
        ...state,
        activeStep: (state.activeStep + 1) as StepNumber,
      }
    }
    case 'previousStep': {
      return {
        ...state,
        activeStep: (state.activeStep - 1) as StepNumber,
      }
    }
    case 'race': {
      return {
        ...state,
        isRace: action.isRace,
      }
    }
    case 'date': {
      return {
        ...state,
        date: action.date,
      }
    }
    case 'time': {
      return {
        ...state,
        time: action.time,
      }
    }
    case 'description': {
      return {
        ...state,
        description: action.description,
      }
    }
    case 'joinEvent': {
      return {
        ...state,
        participants: [
          ...state.participants,
          {
            ...action.me,
            joinedAt: ISODateTimeSchema.parse(new Date().toISOString()),
          },
        ],
      }
    }
    case 'leaveEvent': {
      return {
        ...state,
        participants: state.participants.filter((x) => x.id !== action.me.id),
      }
    }
  }
}
