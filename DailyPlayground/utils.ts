import { Platform } from 'react-native';
import { DailyEventObject } from '@daily-co/react-native-daily-js';

export function logDailyEvent(event?: DailyEventObject) {
  event && console.log('[daily.co event]', event.action);
}

/**
 * For automated testing on browserstack / appium / wd.
 *
 */
export function robotID(id?: string) {
  if (!id) id = '';
  // *coming soon* ios support
  return Platform.OS === 'ios' ? { } : { accessibilityLabel: id };
}
