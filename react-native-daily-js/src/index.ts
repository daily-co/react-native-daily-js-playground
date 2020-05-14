import DailyIframe = require("@daily-co/daily-js");
import { registerGlobals } from "react-native-webrtc";

// Register globals:
// * A URL polyfill
import "react-native-url-polyfill/auto";
// * WebRTC APIs (note that this also sets up the global `window` object)
registerGlobals();
// * A shim to prevent errors (not ideal)
declare const global: any;
global.window.addEventListener = () => {};

export default DailyIframe;
export * from "react-native-webrtc";
