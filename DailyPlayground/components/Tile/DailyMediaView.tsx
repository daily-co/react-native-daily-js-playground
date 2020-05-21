import React, {useMemo} from 'react';
import {ViewStyle, View} from 'react-native';
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
  const stream = useMemo(() => {
    const tracks = [props.videoTrack, props.audioTrack].filter((t) => t);
    return tracks.length > 0 ? new MediaStream(tracks) : null;
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
