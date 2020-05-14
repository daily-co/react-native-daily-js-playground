import {
  MediaStreamTrack,
  RTCView,
  MediaStream,
} from '@daily-co/react-native-daily-js';
import React, {useMemo} from 'react';
import {Text, View, StyleSheet} from 'react-native';

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  isLocalPerson: boolean;
  isLarge: boolean;
  isLoading: boolean;
};

export default function Tile(props: Props) {
  const stream = useMemo(() => {
    const tracks = [props.videoTrack, props.audioTrack].filter((t) => t);
    return tracks.length > 0 ? new MediaStream(tracks) : null;
  }, [props.videoTrack, props.audioTrack]);

  const mediaComponent = useMemo(() => {
    return stream ? (
      <RTCView
        streamURL={stream.toURL()}
        mirror={props.isLocalPerson}
        style={styles.media}
      />
    ) : null;
  }, [stream, props.isLocalPerson]);

  const loadingComponent = useMemo(() => {
    return props.isLoading ? <Text>Loading...</Text> : null;
  }, [props.isLoading]);

  return (
    <View style={styles.container}>
      {mediaComponent}
      {loadingComponent}
    </View>
  );
}

// TODO: support more than 1-on-1 styling, and not just portrait
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    aspectRatio: 9 / 16,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  media: {width: '100%', height: '100%', position: 'absolute'},
  loading: {color: '#ffffff', justifyContent: 'center', alignItems: 'stretch'},
});
