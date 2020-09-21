import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import Daily, {
  DailyEvent,
  DailyCall,
  DailyEventObject,
  DailyEventObjectAppMessage,
} from '@daily-co/react-native-daily-js';
import CallPanel from '../CallPanel/CallPanel';
import StartButton from '../StartButton/StartButton';
import { logDailyEvent } from '../../utils';
import api from '../../api';
import Tray from '../Tray/Tray';
import CallObjectContext from '../../CallObjectContext';
import * as NativeCallSystem from '../../NativeCallSystem';

declare const global: { HermesInternal: null | {} };

// Uncomment during development to temporarily intentionally ignore errors
// and keep going
// (console as any).reportErrorsAsExceptions = false;

enum AppState {
  Idle,
  CreatingRoom,
  AwaitingStartCallInstruction,
  Joining,
  Joined,
  AwaitingEndCallInstruction,
  Leaving,
  Error,
}

const App = () => {
  const [appState, setAppState] = useState(AppState.Idle);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  /**
   * Uncomment to set up debugging globals.
   */
  // useEffect(() => {
  //   const g = global as any;
  //   g.Daily = Daily;
  //   g.callObject = callObject;
  // }, [callObject]);

  /**
   * Uncomment to attach debugging event handlers.
   */
  // useEffect(() => {
  //   if (!callObject) {
  //     return;
  //   }

  //   const events: DailyEvent[] = ['loading', 'load-attempt-failed', 'loaded'];

  //   for (const event of events) {
  //     callObject.on(event, logDailyEvent);
  //   }

  //   return () => {
  //     for (const event of events) {
  //       callObject.off(event, logDailyEvent);
  //     }
  //   };
  // }, [callObject]);

  /**
   * Attach lifecycle event handlers.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    const events: DailyEvent[] = ['joined-meeting', 'left-meeting', 'error'];

    function handleNewMeetingState(event?: DailyEventObject) {
      logDailyEvent(event);
      switch (callObject?.meetingState()) {
        case 'joined-meeting':
          setAppState(AppState.Joined);
          break;
        case 'left-meeting':
          callObject?.destroy().then(() => {
            roomUrl && NativeCallSystem.reportCallEnded(roomUrl);
            setRoomUrl(null);
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
  }, [callObject, roomUrl]);

  /**
   * Listen for app messages from other call participants.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    function handleAppMessage(event?: DailyEventObjectAppMessage) {
      if (event) {
        logDailyEvent(event);
        console.log(`received app message from ${event.fromId}: `, event.data);
      }
    }

    callObject.on('app-message', handleAppMessage);

    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
    };
  }, [callObject]);

  /**
   * Join a call as soon as a callObject is created.
   * This must happen *after* the event handlers are attached, above.
   */
  useEffect(() => {
    if (!callObject || !roomUrl) {
      return;
    }
    callObject.join({ url: roomUrl });
    setAppState(AppState.Joining);
  }, [callObject, roomUrl]);

  /**
   * When we enter a joined or error state, report it to the native call system.
   */
  useEffect(() => {
    if (!roomUrl) {
      return;
    }
    if (appState === AppState.Joined) {
      NativeCallSystem.reportCallStarted(roomUrl);
    } else if (appState === AppState.Error) {
      NativeCallSystem.reportCallFailed(roomUrl);
    }
  }, [appState, roomUrl]);

  useEffect(() => {});

  /**
   * Start a call when the native call system asks us to.
   * Note that for now we're not handling starting a call with a room URL other
   * than one set by interacting with this app (so, not from tapping an phone
   * call history entry).
   */
  const onNativeCallSystemStartCall = useCallback(
    (roomUrlToStartCall: string) => {
      if (callObject || roomUrlToStartCall !== roomUrl) {
        return;
      }
      const newCallObject = Daily.createCallObject();
      setCallObject(newCallObject);
    },
    [roomUrl, callObject]
  );

  /**
   * Abort starting a call when the native call system asks us to.
   * Note that we only expect an abort if native call system permission is
   * pending.
   */
  const onNativeCallSystemAbortStartingCall = useCallback(
    (roomUrlToAbortCall: string) => {
      if (
        !(
          roomUrlToAbortCall === roomUrl &&
          appState === AppState.AwaitingStartCallInstruction
        )
      ) {
        return;
      }
      setRoomUrl(null);
      setAppState(AppState.Idle);
    },
    [roomUrl, appState]
  );

  /**
   * End a call when the native call system asks us to.
   */
  const onNativeCallSystemEndCall = useCallback(
    (roomUrlToEndCall: string) => {
      if (!(callObject && roomUrlToEndCall === roomUrl)) {
        return;
      }
      setAppState(AppState.Leaving);
      callObject.leave();
    },
    [callObject, roomUrl]
  );

  /**
   * Set up handlers for native call system events.
   */
  useEffect(() => {
    NativeCallSystem.addStartCallListener(onNativeCallSystemStartCall);
    NativeCallSystem.addAbortStartingCallListener(
      onNativeCallSystemAbortStartingCall
    );
    NativeCallSystem.addEndCallListener(onNativeCallSystemEndCall);
    return () => {
      NativeCallSystem.removeStartCallListener(onNativeCallSystemStartCall);
      NativeCallSystem.removeAbortStartingCallListener(
        onNativeCallSystemAbortStartingCall
      );
      NativeCallSystem.removeEndCallListener(onNativeCallSystemEndCall);
    };
  }, [
    onNativeCallSystemStartCall,
    onNativeCallSystemAbortStartingCall,
    onNativeCallSystemEndCall,
  ]);

  const startCall = useCallback(() => {
    setAppState(AppState.CreatingRoom);
    return api
      .createRoom()
      .then((room) => {
        setRoomUrl(room.url);
        setAppState(AppState.AwaitingStartCallInstruction);
        NativeCallSystem.askToStartCall(room.url);
      })
      .catch(() => {
        setRoomUrl(null);
        setAppState(AppState.Idle);
      });
  }, []);

  const endCall = useCallback(() => {
    if (!callObject || !roomUrl) {
      return;
    }
    // If we're in the error state, we've already "left", so just clean up
    if (appState === AppState.Error) {
      callObject.destroy().then(() => {
        setRoomUrl(null);
        setCallObject(null);
        setAppState(AppState.Idle);
      });
    } else {
      setAppState(AppState.AwaitingEndCallInstruction);
      NativeCallSystem.askToEndCall(roomUrl);
    }
  }, [callObject, appState, roomUrl]);

  const showCallPanel = [
    AppState.Joining,
    AppState.Joined,
    AppState.Error,
  ].includes(appState);
  const enableCallButtons = [AppState.Joined, AppState.Error].includes(
    appState
  );
  const enableStartButton = appState === AppState.Idle;
  const showStartButtonStarting = [
    AppState.AwaitingStartCallInstruction,
    AppState.CreatingRoom,
  ].includes(appState);

  return (
    <CallObjectContext.Provider value={callObject}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {showCallPanel ? (
            <>
              <CallPanel roomUrl={roomUrl || ''} />
              <Tray onClickLeaveCall={endCall} disabled={!enableCallButtons} />
            </>
          ) : (
            <StartButton
              onPress={startCall}
              disabled={!enableStartButton}
              starting={showStartButtonStarting}
            />
          )}
        </View>
      </SafeAreaView>
    </CallObjectContext.Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4a4a4a',
  },
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
