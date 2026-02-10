import type { EventType } from '@downtown65/schema'
import {
  type Icon,
  IconArmchair,
  IconBike,
  IconBottle,
  IconBrandZwift,
  IconIceSkating,
  IconMap,
  IconRecycle,
  IconRun,
  IconSnowflake,
  IconSparkles,
  IconSwimming,
  IconTrack,
  IconTrees,
  IconTrekking,
  IconTriangleInverted,
} from '@tabler/icons-react'

// const _SIZE = 16

const EVENT_DATA_MAP: Record<
  EventType,
  { imageUrl: string; eventText: string; icon: Icon }
> = {
  CYCLING: {
    eventText: 'Pyöräily',
    icon: IconBike,
    imageUrl: '/event-images/cycling.jpg',
  },
  ICE_HOCKEY: {
    eventText: 'Lätkä',
    icon: IconIceSkating,
    imageUrl: '/event-images/hockey.jpg',
  },
  KARONKKA: {
    eventText: 'Karonkka',
    icon: IconBottle,
    imageUrl: '/event-images/karonkka.jpg',
  },
  MEETING: {
    eventText: 'Kokous',
    icon: IconArmchair,
    imageUrl: '/event-images/meeting.jpg',
  },
  NORDIC_WALKING: {
    eventText: 'Sauvakävely',
    icon: IconTrekking,
    imageUrl: '/event-images/nordicwalking.jpg',
  },
  ORIENTEERING: {
    eventText: 'Suunnistus',
    icon: IconMap,
    imageUrl: '/event-images/orienteering.jpg',
  },
  OTHER: {
    eventText: 'Muu',
    icon: IconRecycle,
    imageUrl: '/event-images/other.jpg',
  },
  RUNNING: {
    eventText: 'Juoksu',
    icon: IconRun,
    imageUrl: '/event-images/running.jpg',
  },
  SKIING: {
    eventText: 'Hiihto',
    icon: IconSnowflake,
    imageUrl: '/event-images/skiing.jpg',
  },
  SPINNING: {
    eventText: 'Spinning',
    icon: IconBrandZwift,
    imageUrl: '/event-images/spinning.jpg',
  },
  SWIMMING: {
    eventText: 'Uinti',
    icon: IconSwimming,
    imageUrl: '/event-images/swimming.jpg',
  },
  TRACK_RUNNING: {
    eventText: 'Ratajuoksu',
    icon: IconTrack,
    imageUrl: '/event-images/trackrunning.jpg',
  },
  TRAIL_RUNNING: {
    eventText: 'Polkujuoksu',
    icon: IconTrees,
    imageUrl: '/event-images/trailrunning.jpg',
  },
  TRIATHLON: {
    eventText: 'Triathlon',
    icon: IconTriangleInverted,
    imageUrl: '/event-images/triathlon.jpg',
  },
  ULTRAS: {
    eventText: 'Ultras',
    icon: IconSparkles,
    imageUrl: '/event-images/ultras.jpg',
  },
}

export const getEventTypeData = (
  type: EventType,
): { imageUrl: string; eventText: string; icon: Icon } => EVENT_DATA_MAP[type]
