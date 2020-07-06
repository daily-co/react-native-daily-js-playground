import React, { useState, useCallback, useEffect, useContext } from 'react';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import { logDailyEvent } from '../../utils';
import { DailyCall } from '@daily-co/react-native-daily-js';
import { useCallObject } from '../../useCallObject';

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
      const [isCameraMuted, isMicMuted] = getStreamStates(callObject);
      setCameraMuted(isCameraMuted);
      setMicMuted(isMicMuted);
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
      <TouchableHighlight
        onPress={toggleMic}
        style={[styles.touchable, styles.muteTouchable]}
        disabled={props.disabled}
      >
        <View
          style={[
            styles.button,
            styles.muteButton,
            isMicMuted ? styles.muteButtonMuted : styles.muteButtonUnmuted,
            props.disabled ? styles.buttonDisabled : null,
          ]}
        >
          <Text>mic</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={props.onClickLeaveCall}
        style={[styles.touchable, styles.leaveTouchable]}
        disabled={props.disabled}
      >
        <View
          style={[
            styles.button,
            styles.leaveButton,
            props.disabled ? styles.buttonDisabled : null,
          ]}
        >
          <Text style={styles.leaveButtonText}>x</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={toggleCamera}
        style={[styles.touchable, styles.muteTouchable]}
        disabled={props.disabled}
      >
        <View
          style={[
            styles.button,
            styles.muteButton,
            isCameraMuted ? styles.muteButtonMuted : styles.muteButtonUnmuted,
            props.disabled ? styles.buttonDisabled : null,
          ]}
        >
          <Text>cam</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // touchable styles
  touchable: {
    marginHorizontal: 10,
  },
  leaveTouchable: {
    borderRadius: 40,
  },
  muteTouchable: {
    borderRadius: 25,
  },
  // button view styles
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.25,
  },
  leaveButton: {
    backgroundColor: '#d81a1a',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  muteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  muteButtonMuted: {
    backgroundColor: '#ffffff',
  },
  muteButtonUnmuted: {
    backgroundColor: '#77dd77',
  },
  // button text styles
  leaveButtonText: {
    color: '#ffffff',
    fontWeight: '200',
    fontSize: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    position: 'relative',
    top: -3,
    left: 1,
  },
});
