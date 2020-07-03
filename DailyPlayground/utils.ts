import { DailyEventObject } from '@daily-co/react-native-daily-js';

export function logDailyEvent(event?: DailyEventObject) {
  event && console.log('[daily.co event]', event.action);
}

export const ROOM_URL = 'https://your-team.daily.co/hello';
