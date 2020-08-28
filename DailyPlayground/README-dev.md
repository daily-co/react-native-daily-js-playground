There are two ways you can use `rn-daily-js-playground`: in “dev mode” or not. This doc covers "dev mode" usage, which is specifically for Daily.co team members. See [README](README.md) for regular usage, and consider it background reading for this document.

## Developing using rn-daily-js-playground

`rn-daily-js-playground` can be a useful development app for `react-native-daily-js` and its dependencies `daily-js` and `@daily-co/react-native-webrtc`.

To use `rn-daily-js-playground` for development (i.e. to enter “dev mode”), first edit `dev_scripts/variables.sh` to point to the appropriate local copies of your repos. Then, simply run:

```
npm run dev-install
```

Now your environment should be ready for local development! From then on:

- To edit **native code**, simply make the changes you want from within Android Studio or Xcode.
- To edit **JS code**, first make the change in your local copy of the appropriate repo, then “sync” it using `npm run dev-sync-js` so the React Native bundler picks it up.
  - Note that, for speed of iteration, `dev-sync-js` does not run `npm i` in each repo, so if you've added any new dependencies to `react-native-daily-js`, `daily-js`, or `@daily-co/react-native-webrtc`, you'll want to do this yourself.

If at any point you find that your dev environment is in a wonky state, revert local changes (across all repos) and re-run `npm run dev-install`.

To leave "dev mode", simply revert local changes (again, across all repos) and run a regular `npm i`. Unlike `npm run dev-install`, `npm i` will not automatically run `npx pod-install`, so make sure to run that before opening your Xcode project.

## Running a local Daily.co server

1. Follow the steps documented in [Building and running pluot-core locally](https://www.notion.so/dailyco/Building-and-running-pluot-core-locally-006e8192a7304fc6b0545c2e527f1aad).
2. Follow the steps documented in [Making calls in SFU mode in your local dev environment](https://www.notion.so/dailyco/Making-calls-in-SFU-mode-in-your-local-dev-environment-66300270ce4f40a4aa0c72b58a7d11ea), since `react-native-daily-js` only makes calls in SFU mode.
3. Follow the steps documented in [Exposing your pluot-core dev server publicly](https://www.notion.so/dailyco/Exposing-your-pluot-core-dev-server-publicly-d70f8aa0836644dabdfc017536d08415) to expose your `pluot-core` server in a way that is reachable by your iOS and Android devices,

## Debugging tips

To open the debug menu, simply shake your device. From there, you can do things like:

- Reload the JS bundle
- Start debugging in Chrome (for console debugging)

### Console debugging

Open the React debug menu, then select "Debug". This will open a Chrome tab. Open Chrome dev tools. In the Console tab of Chrome dev tools, click the dropdown that says "top" and select "debuggerWorker".

NOTE: you may have to reload the JavaScript a couple of times for the debugger to properly connect.

### React hierarchy debugging

First, install `react-devtools`. Then:

```bash
cd DailyPlayground

npx react-devtools
```

You'll be prompted to open the React debug menu in the app.
