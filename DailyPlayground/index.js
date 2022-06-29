/**
 * @format
 */

// Enable debug logs
/*window.localStorage = window.localStorage || {};
window.localStorage.debug = '*';
window.localStorage.getItem = (itemName) => {
  console.log('Requesting the localStorage item ', itemName);
  return window.localStorage[itemName];
};*/

import { AppRegistry } from 'react-native';
import App from './src/components/App/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
