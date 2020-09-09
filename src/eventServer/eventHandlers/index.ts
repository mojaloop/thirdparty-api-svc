


import NotificationEvent from './notificationEvent'
import { EventActionEnum, EventTypeEnum } from '@mojaloop/central-services-shared';

// Make a special interface that lets us strictly define a Action + Type pair as a Key
interface EventActionTypePair {
  action: EventActionEnum,
  type: EventTypeEnum
}


const eventHandlers = new Map<EventActionTypePair, (...args: Array<any>) => any>();

// Add your handlers here
eventHandlers.set({action: EventActionEnum.PUT, type: EventTypeEnum.NOTIFICATION}, NotificationEvent.onEvent)

export default eventHandlers;