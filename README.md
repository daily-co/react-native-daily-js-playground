# rn-daily-js-playground

A playground for developing and testing `daily-js` running in React Native.

## Dev environment setup

First, follow [these instructions](https://reactnative.dev/docs/environment-setup), selecting "React Native CLI Quickstart" and your platform (skipping the part about creating a new application).

```bash
nvm i
npm i
```

## Running in dev

```bash
cd DailyPlayground

# Bundle JS, start JS file server, and start watching for file changes in order to re-bundle
npm run start

# In a separate terminal
# Build iOS app and launch iOS Simulator
npm run ios

# In a separate terminal
# Build Android app and launch Android Emulator
npm run android
```

## Debugging

### Opening the debug menu

- (On a real device) Shake your device
- (In the iOS Simulator) Hit command-control-z or go to Device -> Shake
- (In the Android Simulator) From your terminal window where you ran `npx react-native start`, type "d"

### Reloading after a code change

React Native pushes some changes to device immediatley. For others, you'll want to reload the React Native JS bundles.

- (For simulators) From your terminal window where you ran `npx react-native start`, type "r". This will reload the JS in any simulators connected to the React Native dev server.
- (Or a real device) Shake your device, then from the debug menu that pops up tap "Reload"

### React hierarchy debugging

First, install react-devtools

```bash
cd DailyPlayground

npx react-devtools
```

You'll be prompted to open the React debug menu in the app. Follow the above instructions (under "Opening the debug menu") to do so.

### Console debugging

Open the React debug menu in the app, following the instructions above (under "Opening the debug menu"), then select "Debug". This will open a Chrome tab. Open Chrome dev tools. In the Console tab of Chrome dev tools, click the dropdown that says "top" and select "debuggerWorker".

NOTE: you may have to reload the JavaScript a couple of times for the debugger to properly connect. Do this by following the instructions above (under "Reloading after a code change").
