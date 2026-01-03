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
    imageUrl: '/event-images/cycling.jpg',
    icon: IconBike,
  },
  ICE_HOCKEY: {
    eventText: 'Lätkä',
    imageUrl: '/event-images/hockey.jpg',
    icon: IconIceSkating,
  },
  KARONKKA: {
    eventText: 'Karonkka',
    imageUrl: '/event-images/karonkka.jpg',
    icon: IconBottle,
  },
  MEETING: {
    eventText: 'Kokous',
    imageUrl: '/event-images/meeting.jpg',
    icon: IconArmchair,
  },
  NORDIC_WALKING: {
    eventText: 'Sauvakävely',
    imageUrl: '/event-images/nordicwalking.jpg',
    icon: IconTrekking,
  },
  ORIENTEERING: {
    eventText: 'Suunnistus',
    imageUrl: '/event-images/orienteering.jpg',
    icon: IconMap,
  },
  OTHER: {
    eventText: 'Muu',
    imageUrl: '/event-images/other.jpg',
    icon: IconRecycle,
  },
  RUNNING: {
    eventText: 'Juoksu',
    imageUrl: '/event-images/running.jpg',
    icon: IconRun,
  },
  SKIING: {
    eventText: 'Hiihto',
    imageUrl: '/event-images/skiing.jpg',
    icon: IconSnowflake,
  },
  SPINNING: {
    eventText: 'Spinning',
    imageUrl: '/event-images/spinning.jpg',
    icon: IconBrandZwift,
  },
  SWIMMING: {
    eventText: 'Uinti',
    imageUrl: '/event-images/swimming.jpg',
    icon: IconSwimming,
  },
  TRACK_RUNNING: {
    eventText: 'Ratajuoksu',
    imageUrl: '/event-images/trackrunning.jpg',
    icon: IconTrack,
  },
  TRAIL_RUNNING: {
    eventText: 'Polkujuoksu',
    imageUrl: '/event-images/trailrunning.jpg',
    icon: IconTrees,
  },
  TRIATHLON: {
    eventText: 'Triathlon',
    imageUrl: '/event-images/triathlon.jpg',
    icon: IconTriangleInverted,
  },
  ULTRAS: {
    eventText: 'Ultras',
    imageUrl: '/event-images/ultras.jpg',
    icon: IconSparkles,
  },
}

export const getEventTypeData = (
  type: EventType,
): { imageUrl: string; eventText: string; icon: Icon } => EVENT_DATA_MAP[type]
