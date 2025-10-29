import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  StatusBar,
  View,
  TextInput,
  LogBox,
  Text,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Daily, {
  DailyEvent,
  DailyCall,
  DailyEventObject,
  DailyEventObjectAppMessage,
} from '@daily-co/react-native-daily-js';
import CallPanel from '../CallPanel/CallPanel';
import Button from '../Button/Button';
import StartButton from '../StartButton/StartButton';
import { logDailyEvent, robotID } from '../../utils';
import api from '../../api';
import Tray from '../Tray/Tray';
import CallObjectContext from '../../CallObjectContext';
import CopyLinkButton from '../CopyLinkButton/CopyLinkButton';
import theme from '../../theme';
import { useOrientation, Orientation } from '../../useOrientation';
// @ts-ignore
import packageJson from '../../../package.json';

declare const global: { HermesInternal: null | {} };

// Silence an annoying warning about a harmless require cycle in React Native's
// fetch library.
// See https://github.com/facebook/react-native/issues/23130.
LogBox.ignoreLogs(['Require cycle: node_modules']);
// After upgrading to RN 0.66, app has started to show a warning about the constructor
// of NativeEventEmitter been called with a non-null argument without the required removeListeners.
// See https://github.com/ocetnik/react-native-background-timer/issues/366
// Silencing the warning while It is not fixed by react-native-background-timer
LogBox.ignoreLogs(['new NativeEventEmitter']);

// Uncomment during development to temporarily intentionally ignore errors,
// preventing the red screen from popping up
// (console as any).reportErrorsAsExceptions = false;

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
  const [roomUrl, setRoomUrl] = useState<string | undefined>(undefined);
  const [roomCreateError, setRoomCreateError] = useState<boolean>(false);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [roomUrlFieldValue, setRoomUrlFieldValue] = useState<
    string | undefined
  >(undefined);
  const orientation = useOrientation();

  /**
   * Uncomment to set up debugging globals.
   */
  // useEffect(() => {
  //   const g = global as any;
  //   g.Daily = Daily;
  //   g.callObject = callObject;
  // }, [callObject]);

  /**
   * Uncomment to attach debugging events handlers.
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
            setRoomUrl(undefined);
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
   * Listen for app messages from other call participants.
   * These only show up in the console.
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
   * This effect must happen *after* the event handlers are attached, above.
   */
  useEffect(() => {
    if (!callObject || !roomUrl) {
      return;
    }
    callObject.join({ url: roomUrl }).catch((_) => {
      // Doing nothing here since we handle fatal join errors in another way,
      // via our listener attached to the 'error' event
    });
    setAppState(AppState.Joining);
  }, [callObject, roomUrl]);

  /**
   * Create the callObject as soon as we have a roomUrl.
   * This will trigger the call starting.
   */
  useEffect(() => {
    if (!roomUrl) {
      return;
    }
    const newCallObject = Daily.createCallObject({
      /*dailyConfig: {
        // Point to a specific version of the call-machine bundle
        // @ts-ignore
        callObjectBundleUrlOverride: 'https://b.staging.daily.co/call-ui/0a8807ac0fc0147c996b6db8d8b4c17f640dcd47/static/call-machine-object-bundle.js'
      }*/
    });
    setCallObject(newCallObject);
  }, [roomUrl]);

  /**
   * Create a temporary room that will become available to join.
   */
  const createRoom = () => {
    setRoomCreateError(false);
    setAppState(AppState.Creating);
    api
      .createRoom()
      .then((room) => {
        setRoomUrlFieldValue(room.url);
        setAppState(AppState.Idle);
      })
      .catch(() => {
        setRoomCreateError(true);
        setRoomUrlFieldValue(undefined);
        setAppState(AppState.Idle);
      });
  };

  /**
   * Join the room provided by the user or the temporary room created by createRoom
   */
  const startCall = () => {
    setRoomUrl(roomUrlFieldValue);
  };

  /**
   * Leave the current call.
   * If we're in the error state (AppState.Error), we've already "left", so just
   * clean up our state.
   */
  const leaveCall = useCallback(() => {
    if (!callObject) {
      return;
    }
    if (appState === AppState.Error) {
      callObject.destroy().then(() => {
        setRoomUrl(undefined);
        setRoomUrlFieldValue(undefined);
        setCallObject(null);
        setAppState(AppState.Idle);
      });
    } else {
      setAppState(AppState.Leaving);
      callObject.leave();
    }
  }, [callObject, appState]);

  const showCallPanel = [
    AppState.Joining,
    AppState.Joined,
    AppState.Error,
  ].includes(appState);
  const enableCallButtons = [AppState.Joined, AppState.Error].includes(
    appState
  );
  const isAppStateIdle = appState === AppState.Idle;
  const startButtonDisabled = !isAppStateIdle || !roomUrlFieldValue;

  return (
    <CallObjectContext.Provider value={callObject}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View
          style={styles.container}
          {...robotID(
            `robots-deps-${JSON.stringify(packageJson.dependencies)}`
          )}
        >
          {showCallPanel ? (
            <View
              style={[
                styles.callContainerBase,
                orientation === Orientation.Landscape
                  ? styles.callContainerLandscape
                  : null,
              ]}
            >
              <CallPanel roomUrl={roomUrl || ''} />
              <Tray
                onClickLeaveCall={leaveCall}
                disabled={!enableCallButtons}
              />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={
                orientation === Orientation.Portrait
                  ? styles.homeContainerPortrait
                  : styles.homeContainerLandscape
              }
              alwaysBounceVertical={false}
            >
              <Image
                style={styles.logo}
                source={require('../../../assets/logo.png')}
              />
              <View style={styles.buttonContainer}>
                <Text style={styles.bodyText}>
                  To get started, enter an existing room URL or create a
                  temporary demo room
                </Text>
                <View
                  style={[
                    styles.demoInputContainer,
                    !!roomUrlFieldValue && styles.shortContainer,
                  ]}
                >
                  <TextInput
                    style={styles.roomUrlField}
                    placeholder="Room URL"
                    placeholderTextColor={theme.colors.greyDark}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    {...robotID('robots-room-url')}
                    editable={isAppStateIdle}
                    value={roomUrlFieldValue}
                    onChangeText={(text) => {
                      setRoomUrlFieldValue(text);
                      setRoomCreateError(false);
                    }}
                  />
                  {!!roomUrlFieldValue && (
                    <TouchableWithoutFeedback
                      onPress={() => setRoomUrlFieldValue(undefined)}
                    >
                      <Image
                        style={styles.closeIcon}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableWithoutFeedback>
                  )}
                </View>
                {roomCreateError && (
                  <View style={styles.textRow}>
                    <Image source={require('../../../assets/error.png')} />
                    <Text style={styles.errorText}>
                      Oops! A room couldn't be created.
                    </Text>
                  </View>
                )}
                {roomUrlFieldValue ? (
                  <CopyLinkButton roomUrl={roomUrlFieldValue} />
                ) : (
                  <Button
                    type="secondary"
                    robotId="robots-create-room"
                    onPress={createRoom}
                    label={
                      appState === AppState.Creating
                        ? 'Creating room...'
                        : 'Create demo room'
                    }
                  />
                )}
                <StartButton
                  onPress={startCall}
                  disabled={startButtonDisabled}
                  starting={appState === AppState.Joining}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </CallObjectContext.Provider>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.greyLightest,
  },
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callContainerBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  callContainerLandscape: {
    flexDirection: 'row',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodyText: {
    fontSize: theme.fontSize.base,
    marginBottom: 8,
    fontFamily: theme.fontFamily.body,
  },
  startContainer: {
    flexDirection: 'column',
  },
  homeContainerPortrait: {
    paddingHorizontal: 24,
  },
  homeContainerLandscape: {
    paddingHorizontal: '20%',
  },
  buttonContainer: {
    justifyContent: 'center',
    marginTop: 40,
  },
  logo: {
    alignSelf: 'flex-start',
    marginVertical: 40,
  },
  roomUrlField: {
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
    backgroundColor: theme.colors.white,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.greyDark,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: theme.fontSize.base,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    width: '100%',
  },
  errorText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.red,
    marginLeft: 8,
  },
  demoInputContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  shortContainer: {
    width: '90%',
  },
  closeIcon: {
    height: 16,
    width: 16,
    marginLeft: 16,
  },
});

export default App;
