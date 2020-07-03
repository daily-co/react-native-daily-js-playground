# rn-daily-js-playground

A playground for developing and testing `daily-js` running in React Native.

## Dev environment setup

### General React Native setup

Follow [these instructions](https://reactnative.dev/docs/environment-setup), selecting "React Native CLI Quickstart" and your platform (skipping the part about creating a new application).

### DailyPlayground machine-specific setup

Edit `DailyPlayground/scripts/variables.sh` to point to the right locations in your file system. This will be necessary for using this playground app to iterate on `react-native-daily-js` and `daily-js`.

Then, run the following:

```bash
cd DailyPlayground

# Use the version of node specified in .nvmrc
nvm i

# Instead of npm i, run a special install command that first updates relevant
# package.json files to point to local versions of `react-native-daily-js` and
# `daily-js`, then packages those dependencies for consumption by the React
# Native bundler.
#
# Do not commit the resulting package.json or package-lock.json changes (which
# will happen for both `rn-daily-js-playground` as well as
# `react-native-daily-js`.
#
# Note a regular `npm install` won't subsequently work until those changes are
# discarded.
npm run install-dev

# Generate ios/DailyPlayground.xcworkspace
npx pod-install
```

## Running in dev

### Server

1. Follow the steps documented in [Building and running pluot-core locally](https://www.notion.so/dailyco/Building-and-running-pluot-core-locally-006e8192a7304fc6b0545c2e527f1aad).
2. Follow the steps documented in [Making calls in SFU mode in your local dev environment](https://www.notion.so/dailyco/Making-calls-in-SFU-mode-in-your-local-dev-environment-66300270ce4f40a4aa0c72b58a7d11ea).

### Client

First, update `utils.ts` to point to the Daily.co room you wish to use for testing (by default it's set to a non-functioning placeholder URL).

```bash
cd DailyPlayground

# Bundle JS, start JS file server, and start watching for file changes in order
# to re-bundle
npm start -- --reset-cache

# Open up a new terminal window

# After plugging in an Android device configured for debugging...
npm run android

# After plugging in an iOS device configured for debugging...
# (see below for additional one-time setup)
open ios/DailyPlayground.xcworkspace
```

### Note: building to iOS device

The iOS Simulator, sadly, doesn't provide a fake video stream. To build to device:

- In the Xcode DailyPlayground target settings, provide a development team registered with Apple
- Expose your `pluot-core` dev server in a way that is reachable by your iOS device, following the steps documented in [Exposing your pluot-core dev server publicly](https://www.notion.so/dailyco/Exposing-your-pluot-core-dev-server-publicly-d70f8aa0836644dabdfc017536d08415)

Note that, as long as you're on the same wifi as the dev box running the React Native development server, the app should just work.

## Syncing changes in `react-native-daily-js` or `daily-js`

When you make a change to either `react-native-daily-js` or `daily-js`, you'll have to "sync" those changes in a special way in order for the React Native bundler to pick them up. If you're curious, you can read about why in `pack-daily.sh`.

```bash
# After you've made your change...

cd DailyPlayground

npm run sync-daily

# If there's been a change to native iOS code in `react-native-daily-js`...
npx pod-install
```

Note that if any native code has changed in `react-native-daily-js`, you'll have to rebuild the `DailyPlayground` app following the steps in the previous section.

**NOTE #1** If you've changed any transitive dependencies of `react-native-daily-js` or `daily-js`, `npm run sync-daily` won't `npm i` in those packages for you (this choice was made in order to shorten the iteration cycle). You'll have to run `npm i` on those packages manually or just do a fresh `npm run install-dev`.

**NOTE #2** Remember to update `DailyPlayground/scripts/variables.sh` if either `react-native-daily-js` or `daily-js` has moved in your file system, or else `npm run sync-daily` won't work.

## Fast path for syncing native code changes in `react-native-daily-js`

`react-native-daily-js` contains some native iOS and Android code in Objective-C and Java, respectively. You can use `DailyPlayground` to iterate on that code even more quickly than following the steps above.

### iOS

Assuming you're in a state where you can successfully build and run on iOS, uncomment (and appropriately update) the following line in the `Podfile`:

```ruby
# Uncomment (and point to the right place) during development to enable
# editing react-native-daily-js's native iOS files directly in
# DailyPlayground without having to reinstall the npm package and run another
# pod install
# pod 'react-native-daily-js', :path => '~/src/pluot-core/react-native-daily-js'
```

Then the next `npx pod-install` will update `ios/DailyPlayground.xcworkspace` to point directly at your files in `react-native-daily-js`, letting you iterate on them in Xcode in the context of this playground app.

### Android

Follow the instructions in the following section of `react-native-daily-js`'s `react-native.config.js` file:

```js
// Uncomment the below (and point to the right place, and comment the
// above) during development to enable editing react-native-daily-js's
// native Android files directly in DailyPlayground without having to
// reinstall the npm package. Unfortunately the path must be relative.
// android: {
//   sourceDir: '../../../../../pluot-core/react-native-daily-js/android/',
// },
```

Then on the next `npm sync-daily` or `npm install-dev`, the `DailyPlayground` Android project will point directly at your files in `react-native-daily-js`, letting you iterate on them in Android Studio in the context of this playground app.

## Debugging

### Opening the debug menu

- (On a real device) Shake your device
- (In the iOS Simulator) Hit command-control-z or go to Device -> Shake
- (In the Android Simulator) From your terminal window where you ran `npx react-native start`, type "d"

### Reloading after a code change

React Native pushes some changes to device immediatley. For others, you'll want to reload the React Native JS bundles.

- (Or a real device) Shake your device, then from the debug menu that pops up tap "Reload"
- (For simulators) From your terminal window where you ran `npx react-native start`, type "r". This will reload the JS in any simulators connected to the React Native dev server.

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
