import { NativeModules, NativeEventEmitter } from 'react-native';

const { CallSystem } = NativeModules;

const eventEmitter = new NativeEventEmitter(CallSystem);

let startCallListeners: Set<(roomUrl: string) => void> = new Set();
let abortStartingCallListeners: Set<(roomUrl: string) => void> = new Set();
let endCallListeners: Set<(roomUrl: string) => void> = new Set();

eventEmitter.addListener('EventStartCall', (event) => {
  if (!(event && event.roomUrl)) {
    return;
  }
  startCallListeners.forEach((listener) => listener(event.roomUrl));
});

eventEmitter.addListener('EventAbortStartingCall', (event) => {
  if (!(event && event.roomUrl)) {
    return;
  }
  abortStartingCallListeners.forEach((listener) => listener(event.roomUrl));
});

eventEmitter.addListener('EventEndCall', (event) => {
  if (!(event && event.roomUrl)) {
    return;
  }
  endCallListeners.forEach((listener) => listener(event.roomUrl));
});

//
// Methods asking the call system for a go-ahead to do what our user asks of us
//

export function askToStartCall(roomUrl: string) {
  CallSystem.askToStartCall(roomUrl);
}

export function askToEndCall(roomUrl: string) {
  CallSystem.askToEndCall(roomUrl);
}

//
// Methods keeping the call system informed about the state of our call
//

export function reportCallStarted(roomUrl: string) {
  CallSystem.reportCallStarted(roomUrl);
}

export function reportCallFailed(roomUrl: string) {
  CallSystem.reportCallFailed(roomUrl);
}

export function reportCallEnded(roomUrl: string) {
  CallSystem.reportCallEnded(roomUrl);
}

//
// Methods for listening to the call system to do what's asked of us
//

export function addStartCallListener(listener: (roomUrl: string) => void) {
  startCallListeners.add(listener);
}

export function removeStartCallListener(listener: (roomUrl: string) => void) {
  startCallListeners.delete(listener);
}

export function addAbortStartingCallListener(
  listener: (roomUrl: string) => void
) {
  abortStartingCallListeners.add(listener);
}

export function removeAbortStartingCallListener(
  listener: (roomUrl: string) => void
) {
  abortStartingCallListeners.delete(listener);
}

export function addEndCallListener(listener: (roomUrl: string) => void) {
  endCallListeners.add(listener);
}

export function removeEndCallListener(listener: (roomUrl: string) => void) {
  endCallListeners.delete(listener);
}
