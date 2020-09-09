# rn-daily-js-playground

A simple app showcasing `react-native-daily-js`, the [Daily.co](https://www.daily.co) library for React Native.

## Usage

### General React Native setup

In [the React Native development environment setup page](https://reactnative.dev/docs/environment-setup), select "React Native CLI Quickstart" and follow the instructions under the heading "Installing dependencies".

### Building

```bash
cd DailyPlayground

# Use the version of node specified in .nvmrc
nvm i

npm i

# Generate ios/DailyPlayground.xcworkspace
npx pod-install
```

### Running the React Native dev server

```bash
cd DailyPlayground

# Bundle JS, start JS file server, and start watching for file changes in order
# to re-bundle
npm start -- --reset-cache
```

Leave this terminal tab open and running.

### Running on iOS

First, you'll need to do a bit of one-time setup. Open `DailyPlayground.xcworkspace` and, in the DailyPlayground target settings, provide a development team registered with Apple. This is required to build to device.

Then simply hit Run with your device plugged in and selected in Xcode. Note that, as long as you're on the same wifi as your dev box running the React Native development server, the app should just work.

### Running on Android

After plugging in an Android device configured for debugging, simply run:

```
npm run android
```
