import React, { useState, useCallback, useEffect } from 'react';
import Config from 'react-native-config';
import { StyleSheet, View } from 'react-native';
import { logDailyEvent } from '../../utils';
import { DailyCall } from '@daily-co/react-native-daily-js';
import { useCallObject } from '../../useCallObject';
import theme from '../../theme';
import TrayButton from '../TrayButton/TrayButton';
import { useOrientation, Orientation } from '../../useOrientation';

/**
 * Gets [isCameraMuted, isMicMuted].
 * This function is declared outside Tray() so it's not recreated every render
 * (which would require us to declare it as a useEffect dependency).
 */
function getDeviceStates(callObject: DailyCall) {
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

function getStreamingState(callObject: DailyCall) {
  // TODO: do we have a getLiveStreaming or something?
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
  const [isStreaming, setStreaming] = useState(false);
  const orientation = useOrientation();

  const toggleCamera = useCallback(() => {
    callObject?.setLocalVideo(isCameraMuted);
  }, [callObject, isCameraMuted]);

  const toggleMic = useCallback(() => {
    callObject?.setLocalAudio(isMicMuted);
  }, [callObject, isMicMuted]);

  const toggleStreaming = useCallback(() => {
    if (isStreaming === true) {
      callObject?.stopLiveStreaming();
      setStreaming(false);
    } else {
      console.log('Starting live stream to: ' + Config.STREAM_URL);
      callObject?.startLiveStreaming({
        rtmpUrl: Config.STREAM_URL,
        width: 1280,
        height: 720,
        layout: {
          preset: 'default',
          max_cam_streams: 5,
        },
      });
      setStreaming(true);
    }
  }, [callObject, isStreaming]);
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
      const [cameraMuted, micMuted] = getDeviceStates(callObject);
      setCameraMuted(cameraMuted);
      setMicMuted(micMuted);
    };

    const handleLiveStreamStarted = (event?: any) => {
      setStreaming(true);
    };

    const handleLiveStreamStopped = (event?: any) => {
      setStreaming(false);
    };

    const handleLiveStreamError = (event?: any) => {
      console.log('Live stream error: ', event);
      setStreaming(false);
    };
    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    callObject.on('participant-updated', handleNewParticipantsState);
    callObject.on('live-streaming-started', handleLiveStreamStarted);
    callObject.on('live-streaming-stopped', handleLiveStreamStopped);
    callObject.on('live-streaming-error', handleLiveStreamError);
    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-updated', handleNewParticipantsState);
    };
  }, [callObject]);

  return (
    <View
      style={[
        styles.containerBase,
        orientation === Orientation.Portrait
          ? styles.containerPortrait
          : styles.containerLandscape,
      ]}
    >
      <View
        style={
          orientation === Orientation.Portrait
            ? styles.controlsPortrait
            : styles.controlsLandscape
        }
      >
        <TrayButton
          disabled={disabled}
          onPress={toggleMic}
          muted={isMicMuted}
          text={isMicMuted ? 'Unmute' : 'Mute'}
          type="mic"
        />
        <TrayButton
          disabled={disabled}
          onPress={toggleCamera}
          muted={isCameraMuted}
          text={isCameraMuted ? 'Turn on' : 'Turn off'}
          type="camera"
        />
        {!!Config.STREAM_URL && !!Config.DAILY_CALL_TOKEN && (
          <TrayButton
            disabled={disabled}
            onPress={toggleStreaming}
            muted={!isStreaming}
            text={isStreaming ? 'Stop stream' : 'Stream'}
            type="stream"
          />
        )}
      </View>
      <TrayButton
        disabled={disabled}
        onPress={onClickLeaveCall}
        text="Leave"
        type="leave"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerBase: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.greyLight,
    borderTopColor: theme.colors.grey,
  },
  containerPortrait: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  containerLandscape: {
    height: '100%',
    position: 'absolute',
    right: 0,
    flexDirection: 'column-reverse',
    borderLeftWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  controlsPortrait: {
    flexDirection: 'row',
  },
  controlsLandscape: {
    flexDirection: 'column-reverse',
  },
});
