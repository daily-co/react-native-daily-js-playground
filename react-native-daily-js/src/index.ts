import DailyIframe = require("@daily-co/daily-js");
import { registerGlobals } from "react-native-webrtc";

// Set up globals:
// * URL
// * WebRTC APIs (note that this also sets up the global `window` object)
import 'react-native-url-polyfill/auto';
registerGlobals();

export default DailyIframe;
export * from "react-native-webrtc";
