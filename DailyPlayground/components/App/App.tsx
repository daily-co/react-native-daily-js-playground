import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import DailyIframe from '@daily-co/react-native-daily-js';
import CallPanel from '../CallPanel/CallPanel';
import StartButton from '../StartButton/StartButton';
import {Event} from '@daily-co/daily-js';
import {logDailyEvent, ROOM_URL} from '../../utils';

declare const global: {HermesInternal: null | {}};

console.log('DISABLING EXCEPTIONS!!'); // TODO: eventually remove
(console as any).reportErrorsAsExceptions = false;

enum AppState {
  Idle,
  Creating,
  Joining,
  Joined,
  Leaving,
  Error,
}

const App = () => {
  const [appState, setAppState] = useState(AppState.Idle);
  const [callObject, setCallObject] = useState<DailyIframe | null>(null);

  /**
   * Assign debugging globals.
   */
  useEffect(() => {
    const g = global as any;
    g.DailyIframe = DailyIframe;
    g.callObject = callObject;
  }, [callObject]);

  /**
   * Attach debugging events handlers.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    const events: Event[] = ['loading', 'loaded'];

    for (const event of events) {
      callObject.on(event, logDailyEvent);
    }

    return () => {
      for (const event of events) {
        callObject.off(event, logDailyEvent);
      }
    };
  }, [callObject]);

  /**
   * Attach lifecycle event handlers.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    const events: Event[] = ['joined-meeting', 'left-meeting', 'error'];

    function handleNewMeetingState(event?: any) {
      event && logDailyEvent(event);
      switch (callObject?.meetingState()) {
        case 'joined-meeting':
          setAppState(AppState.Joined);
          break;
        case 'left-meeting':
          callObject?.destroy().then(() => {
            setCallObject(null);
            setAppState(AppState.Idle);
          });
          break;
        case 'error':
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

  /**
   * Join a call as soon as a callObject is created.
   * This must happen *after* the event handlers are attached, above.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }
    callObject.join({url: ROOM_URL});
    setAppState(AppState.Joining);
  }, [callObject]);

  const startCall = useCallback(() => {
    const newCallObject = DailyIframe.createCallObject();
    setCallObject(newCallObject);
  }, []);

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
          <CallPanel roomUrl={ROOM_URL} callObject={callObject} />
        ) : (
          <StartButton onPress={startCall} disabled={!enableStartButton} />
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
