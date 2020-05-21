# rn-daily-js-playground

A playground for developing and testing `daily-js` running in React Native.

## Dev environment setup

### General React Native setup

Follow [these instructions](https://reactnative.dev/docs/environment-setup), selecting "React Native CLI Quickstart" and your platform (skipping the part about creating a new application).

### DailyPlayground machine-specific setup

Edit `DailyPlayground/scripts/variables.sh` to point to the right locations in your file system, and to the versions of each dependency that you have checked out. This will be necessary for building and iterating on `react-native-daily-js`, `daily-js`, and `types-daily-js` all at once.

```bash
cd DailyPlayground

nvm i

# Updates relevant package.json files to point to local versions of `react-native-daily-js`, `daily-js`, and `types-daily-js`.
# Do not commit the resulting changes.
npm run dev-setup

npm i
```

## Running in dev

### Server

1. Follow the steps documented in [Building and running pluot-core locally](https://www.notion.so/dailyco/Building-and-running-pluot-core-locally-006e8192a7304fc6b0545c2e527f1aad).
2. Follow the steps documented in [Making calls in SFU mode in your local dev environment](https://www.notion.so/dailyco/Making-calls-in-SFU-mode-in-your-local-dev-environment-66300270ce4f40a4aa0c72b58a7d11ea).

### Client

```bash
cd DailyPlayground

# Bundle JS, start JS file server, and start watching for file changes in order to re-bundle
npm run start

# In a separate terminal
# Build iOS app and launch iOS Simulator
npm run ios

# In a separate terminal
# Build Android app and launch Android Virtual Device (or real device, if one is plugged in and configured for debugging)
npm run android
```

## Syncing changes to `react-native-daily-js`, `daily-js`, or `types-daily-js`

When you make a change to either `react-native-daily-js`, `daily-js`, or `types-daily-js`, you'll have to "sync" those changes in a special way in order for the React Native bundler to pick them up. If you're curious, you can read about why in `pack-daily.sh`.

```bash
# After your change...
cd DailyPlayground

npm run sync-daily
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

## Building to device

### iOS

The iOS Simulator, sadly, doesn't provide a fake video stream. To build to device:

- In the Xcode DailyPlayground target settings, provide a development team registered with Apple
- Expose your `pluot-core` dev server in a way that is reachable by your iOS device, following the steps documented in [Exposing your pluot-core dev server publicly](https://www.notion.so/dailyco/Exposing-your-pluot-core-dev-server-publicly-d70f8aa0836644dabdfc017536d08415).

Note that, as long as you're on the same wifi as the dev box running the React Native development server, the app should just work.
