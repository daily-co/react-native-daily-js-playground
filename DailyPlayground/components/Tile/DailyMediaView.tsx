import React, {useMemo, useState, useEffect} from 'react';
import {ViewStyle, View, Platform} from 'react-native';
import {
  MediaStreamTrack,
  RTCView,
  MediaStream,
  RTCViewProps,
} from '@daily-co/react-native-daily-js';

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  mirror?: RTCViewProps['mirror'];
  zOrder?: RTCViewProps['zOrder'];
  objectFit?: RTCViewProps['objectFit'];
  style?: ViewStyle;
};

// TODO: move to react-native-daily-js
export default function DailyMediaView(props: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const tracks = [props.videoTrack, props.audioTrack].filter((t) => t);
    const stream = tracks.length > 0 ? new MediaStream(tracks) : null;
    // Temporary workaround for an Android react-native-webrtc threading bug
    // where a newly-created stream is sometimes not yet ready for use
    // immediately in the JS thread. Waiting 100ms is not necessarily
    // foolproof, but I haven't seen an issue with this during local testing.
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setStream(stream);
      }, 100);
    } else {
      setStream(stream);
    }
  }, [props.videoTrack, props.audioTrack]);

  return stream ? (
    <RTCView
      streamURL={stream.toURL()}
      mirror={props.mirror}
      zOrder={props.zOrder}
      objectFit={props.objectFit}
      style={props.style}
    />
  ) : (
    <View style={props.style} />
  );
}
