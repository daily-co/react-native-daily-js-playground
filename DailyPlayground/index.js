import {registerRootComponent} from 'expo';

// Enable debug logs
/*window.localStorage = window.localStorage || {};
window.localStorage.debug = '*';
window.localStorage.getItem = (itemName) => {
  console.log('Requesting the localStorage item ', itemName);
  return window.localStorage[itemName];
};*/

//Disable webrtc logs
/*import debug from 'debug';
debug.disable('rn-webrtc:*');*/

import App from './src/components/App/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
