import { MediaStreamTrack } from '@daily-co/react-native-daily-js';
import React, { useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  ViewStyle,
} from 'react-native';
import { DailyMediaView } from '@daily-co/react-native-daily-js';

export enum TileType {
  Thumbnail,
  HalfWidth,
  FullWidth,
}

type Props = {
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  mirror: boolean;
  type: TileType;
  isLoading: boolean;
  onPress?: () => void;
};

export default function Tile(props: Props) {
  const mediaComponent = useMemo(() => {
    return (
      <DailyMediaView
        videoTrack={props.videoTrack}
        audioTrack={props.audioTrack}
        mirror={props.mirror}
        // Assumption: thumbnails are on top
        zOrder={props.type === TileType.Thumbnail ? 1 : 0}
        style={styles.media}
        objectFit="cover"
      />
    );
  }, [props.videoTrack, props.audioTrack, props.mirror, props.type]);

  const touchableMediaComponent = useMemo(() => {
    return (
      <TouchableHighlight
        onPress={props.onPress}
        disabled={!props.onPress}
        style={styles.media}
      >
        {mediaComponent}
      </TouchableHighlight>
    );
  }, [props.onPress, mediaComponent]);

  const loadingComponent = useMemo(() => {
    return props.isLoading ? (
      <Text style={styles.loading}>Loading...</Text>
    ) : null;
  }, [props.isLoading]);

  let typeSpecificStyle: ViewStyle | null = null;
  switch (props.type) {
    case TileType.HalfWidth:
      typeSpecificStyle = styles.containerHalfWidth;
      break;
    case TileType.FullWidth:
      typeSpecificStyle = styles.containerFullWidth;
      break;
  }

  return (
    <View
      style={[
        styles.container,
        props.isLoading || !props.videoTrack
          ? styles.containerLoadingOrNotShowingVideo
          : null,
        typeSpecificStyle,
      ]}
    >
      {touchableMediaComponent}
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
    aspectRatio: 1,
  },
  containerHalfWidth: {
    width: '50%',
  },
  containerFullWidth: {
    width: '100%',
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
