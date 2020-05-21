import {
  MediaStreamTrack,
  RTCView,
  MediaStream,
} from '@daily-co/react-native-daily-js';
import React, {useMemo} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {DailyMediaView} from '@daily-co/react-native-daily-js';

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  isLocalPerson: boolean;
  isLarge: boolean;
  isLoading: boolean;
};

export default function Tile(props: Props) {
  const mediaComponent = useMemo(() => {
    return (
      <DailyMediaView
        videoTrack={props.videoTrack}
        audioTrack={props.audioTrack}
        mirror={props.isLocalPerson}
        zOrder={props.isLocalPerson ? 1 : 0}
        style={styles.media}
      />
    );
  }, [props.videoTrack, props.audioTrack, props.isLocalPerson]);

  const loadingComponent = useMemo(() => {
    return props.isLoading ? (
      <Text style={styles.loading}>Loading...</Text>
    ) : null;
  }, [props.isLoading]);

  return (
    <View
      style={[
        styles.container,
        props.isLoading ? styles.containerLoading : null,
      ]}>
      {mediaComponent}
      {loadingComponent}
    </View>
  );
}

// TODO: support more than 1-on-1 styling, and not just portrait
const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  containerLoading: {
    backgroundColor: '#000000',
  },
  media: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  loading: {
    color: '#ffffff',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});
