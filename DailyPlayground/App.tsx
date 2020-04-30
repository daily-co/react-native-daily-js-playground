import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import DailyIframe from '@daily-co/react-native-daily-js';
import CallPanel from './components/CallPanel';
import StartButton from './components/StartButton';
import { Event } from '@daily-co/daily-js';

declare const global: {HermesInternal: null | {}};

const ROOM_URL = 'https://paulk.ngrok.io/hello?cdmn=paulk';

enum AppState {
  Idle,
  Creating,
  Joining,
  Joined,
  Leaving,
  Error,
}

function logDailyEvent(e: any) {
  console.log('[daily.co event]', e.action);
}

const App = () => {
  const [appState, setAppState] = useState(AppState.Idle);
  const [callObject, setCallObject] = useState<DailyIframe | null>(null);

  // Debugging globals
  useEffect(() => {
    const g = global as any;
    g.DailyIframe = DailyIframe;
    g.callObject = callObject;
  }, [callObject]);

  const startJoiningCall = useCallback(() => {
    const newCallObject = DailyIframe.createCallObject();
    setCallObject(newCallObject);
    setAppState(AppState.Joining);
    newCallObject.join({url: ROOM_URL});
  }, []);

  useEffect(() => {
    if (!callObject) {
      return;
    }

    const events: Event[] = ["joined-meeting", "left-meeting", "error"];

    function handleNewMeetingState(event?: any) {
      event && logDailyEvent(event);
      switch (callObject?.meetingState()) {
        case "joined-meeting":
          setAppState(AppState.Joined);
          break;
        case "left-meeting":
          callObject?.destroy().then(() => {
            setCallObject(null);
            setAppState(AppState.Idle);
          });
          break;
        case "error":
          setAppState(AppState.Error);
          break;
        default:
          break;
      }
    }

    // Use initial state
    handleNewMeetingState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewMeetingState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewMeetingState);
      }
    };
  }, [callObject]);

  const showCallPanel = [
    AppState.Joining,
    AppState.Joined,
    AppState.Error,
  ].includes(appState);
  const enableStartButton = appState === AppState.Idle;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {showCallPanel ? (
          <CallPanel roomUrl={ROOM_URL} />
        ) : (
          <StartButton
            onPress={startJoiningCall}
            disabled={!enableStartButton}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4a4a4a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

export default App;
