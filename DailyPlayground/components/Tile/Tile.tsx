import {MediaStreamTrack} from '@daily-co/react-native-daily-js';
import React, {useMemo, useContext, useCallback} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';
import {DailyMediaView} from '@daily-co/react-native-daily-js';
import CallObjectContext from '../../CallObjectContext';

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  isLocalPerson: boolean;
  isLoading: boolean;
};

export default function Tile(props: Props) {
  const callObject = useContext(CallObjectContext);

  const cycleCamera = useCallback(() => {
    if (!callObject) {
      return;
    }
    props.isLocalPerson && callObject.cycleCamera();
  }, [callObject, props.isLocalPerson]);

  const mediaComponent = useMemo(() => {
    return (
      <TouchableHighlight
        onPress={cycleCamera}
        style={styles.mediaOrTouchableWrapper}>
        <DailyMediaView
          videoTrack={props.videoTrack}
          audioTrack={props.audioTrack}
          mirror={props.isLocalPerson}
          zOrder={props.isLocalPerson ? 1 : 0}
          style={styles.mediaOrTouchableWrapper}
        />
      </TouchableHighlight>
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
  containerLoadingOrNotShowingVideo: {
    backgroundColor: '#000000',
  },
  mediaOrTouchableWrapper: {
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
