import { DailyEventObject } from '@daily-co/react-native-daily-js';

export function logDailyEvent(event?: DailyEventObject) {
  event && console.log('[daily.co event]', event.action);
}
