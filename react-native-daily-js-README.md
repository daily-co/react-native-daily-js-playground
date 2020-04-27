# react-native-daily-js

The Daily.co JavaScript library for React Native.

## Minimum OS/SDK versions

Under the hood, `react-native-daily-js` depends on `react-native-webrtc`, the popular implementation of WebRTC for React Native. This package introduces some constraints on what OS/SDK versions your project can support:

- **iOS**: Deployment target >= 10.0
- **Android**:
  - `minSdkVersion` >= 21 (if you downgrade to gradle 3.3.2)
  - `minSdkVersion` >= 24 (if you're depending on a newer version of gradle)

The above can be specified in your Xcode target settings and your project-level `build.gradle` file.

## Installation

TODO

## Post-installation

In your Xcode project's `Info.plist`, provide user-facing strings explaining why your app is asking for camera and microphone access, under the following keys:

- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`

Note that your app will not be able to even prompt for access if these strings aren't specified.
