import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  Image,
} from 'react-native';
import { logDailyEvent } from '../../utils';
import { DailyCall } from '@daily-co/react-native-daily-js';
import { useCallObject } from '../../useCallObject';
import theme from '../../theme';

/**
 * Gets [isCameraMuted, isMicMuted].
 * This function is declared outside Tray() so it's not recreated every render
 * (which would require us to declare it as a useEffect dependency).
 */
function getStreamStates(callObject: DailyCall) {
  let isCameraMuted = false,
    isMicMuted = false;
  if (
    callObject &&
    callObject.participants() &&
    callObject.participants().local
  ) {
    const localParticipant = callObject.participants().local;
    isCameraMuted = !localParticipant.video;
    isMicMuted = !localParticipant.audio;
  }
  return [isCameraMuted, isMicMuted];
}

type Props = {
  onClickLeaveCall: () => void;
  disabled: boolean;
};

export const TRAY_HEIGHT = 80;

export default function Tray(props: Props) {
  const callObject = useCallObject();
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);

  const toggleCamera = useCallback(() => {
    callObject?.setLocalVideo(isCameraMuted);
  }, [callObject, isCameraMuted]);

  const toggleMic = useCallback(() => {
    callObject?.setLocalAudio(isMicMuted);
  }, [callObject, isMicMuted]);

  /**
   * Start listening for participant changes when callObject is set (i.e. when the component mounts).
   * This event will capture any changes to your audio/video mute state.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    const handleNewParticipantsState = (event?: any) => {
      event && logDailyEvent(event);
      const [cameraMuted, micMuted] = getStreamStates(callObject);
      setCameraMuted(cameraMuted);
      setMicMuted(micMuted);
    };

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    callObject.on('participant-updated', handleNewParticipantsState);

    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-updated', handleNewParticipantsState);
    };
  }, [callObject]);

  return (
    <View
      style={[styles.container, !props.disabled && styles.disabledContainer]}
    >
      <View style={styles.controls}>
        <TouchableHighlight
          onPress={toggleMic}
          style={styles.touchable}
          disabled={props.disabled}
        >
          {isMicMuted ? (
            <Image
              style={styles.icon}
              source={require('../../assets/mic-off.png')}
            />
          ) : (
            <Image
              style={styles.icon}
              source={require('../../assets/mic.png')}
            />
          )}
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.touchable}
          onPress={toggleCamera}
          disabled={props.disabled}
        >
          {isCameraMuted ? (
            <Image
              style={styles.icon}
              source={require('../../assets/camera-off.png')}
            />
          ) : (
            <Image
              style={styles.icon}
              source={require('../../assets/camera.png')}
            />
          )}
        </TouchableHighlight>
      </View>
      <TouchableHighlight
        onPress={props.onClickLeaveCall}
        style={styles.touchable}
        disabled={props.disabled}
      >
        <Image
          style={styles.iconLeave}
          source={require('../../assets/leave.png')}
        />
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.greyLight,
    borderTopColor: theme.colors.grey,
    borderTopWidth: 1,
    padding: 24,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
  },
  touchable: {
    backgroundColor: theme.colors.greyLight,
    marginRight: 20,
  },
  icon: {
    height: 32,
    width: 32,
    backgroundColor: theme.colors.greyLight,
  },
  iconLeave: {
    height: 28,
    width: 36,
    backgroundColor: theme.colors.greyLight,
  },
});
