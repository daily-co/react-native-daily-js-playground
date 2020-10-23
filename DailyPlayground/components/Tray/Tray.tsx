import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Text,
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

export const TRAY_HEIGHT = 90;

export default function Tray({ disabled, onClickLeaveCall }: Props) {
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
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableWithoutFeedback onPress={toggleMic} disabled={disabled}>
          <View style={styles.controlContainer}>
            {isMicMuted ? (
              <Image
                style={[styles.icon, disabled && styles.disabled]}
                source={require('../../assets/mic-off.png')}
              />
            ) : (
              <Image
                style={[styles.icon, disabled && styles.disabled]}
                source={require('../../assets/mic.png')}
              />
            )}
            <Text style={[styles.controlText, isMicMuted && styles.offText]}>
              {isMicMuted ? 'Unmute' : 'Mute'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={toggleCamera} disabled={disabled}>
          <View style={styles.controlContainer}>
            {isCameraMuted ? (
              <Image
                style={[styles.icon, disabled && styles.disabled]}
                source={require('../../assets/camera-off.png')}
              />
            ) : (
              <Image
                style={[styles.icon, disabled && styles.disabled]}
                source={require('../../assets/camera.png')}
              />
            )}
            <Text style={[styles.controlText, isCameraMuted && styles.offText]}>
              {isCameraMuted ? 'Turn on' : 'Turn off'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <TouchableWithoutFeedback onPress={onClickLeaveCall} disabled={disabled}>
        <View style={styles.controlContainer}>
          <Image
            style={[styles.iconLeave, disabled && styles.disabled]}
            source={require('../../assets/leave.png')}
          />
          <Text style={[styles.controlText, styles.offText]}>Leave</Text>
        </View>
      </TouchableWithoutFeedback>
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
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  controls: {
    flexDirection: 'row',
  },
  icon: {
    height: 32,
    width: 32,
    marginHorizontal: 16,
    backgroundColor: theme.colors.greyLight,
  },
  iconLeave: {
    height: 28,
    width: 36,
    marginHorizontal: 16,
    backgroundColor: theme.colors.greyLight,
  },
  disabled: {
    opacity: 0.6,
  },
  controlContainer: {
    alignItems: 'center',
  },
  controlText: {
    fontWeight: '500',
    paddingTop: 4,
    color: theme.colors.blueDark,
  },
  offText: {
    color: theme.colors.red,
  },
});
