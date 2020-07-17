import { MediaStreamTrack } from '@daily-co/react-native-daily-js';
import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DailyMediaView } from '@daily-co/react-native-daily-js';

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  isLocalPerson: boolean;
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
        objectFit="cover"
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
        props.isLoading || !props.videoTrack
          ? styles.containerLoadingOrNotShowingVideo
          : null,
        props.isLocalPerson ? styles.containerLocal : styles.containerRemote,
      ]}
    >
      {mediaComponent}
      {loadingComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  containerLocal: {
    aspectRatio: 9 / 16,
  },
  containerRemote: {
    width: '50%',
    aspectRatio: 1,
  },
  containerLoadingOrNotShowingVideo: {
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
