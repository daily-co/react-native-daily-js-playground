import { MediaStreamTrack } from '@daily-co/react-native-daily-js';
import React, { useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  ViewStyle,
  Image,
} from 'react-native';
import { DailyMediaView } from '@daily-co/react-native-daily-js';
import theme from '../../theme';
import { useOrientation, Orientation } from '../../useOrientation';

export enum TileType {
  Thumbnail,
  Half,
  Full,
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
  const orientation = useOrientation();

  const mediaComponent = useMemo(() => {
    return (
      <DailyMediaView
        videoTrack={props.videoTrack}
        audioTrack={props.audioTrack}
        mirror={props.mirror}
        // Assumption: thumbnails should appear layered on top of other tiles
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

  const muteOverlayComponent = useMemo(() => {
    return (!props.videoTrack || !props.audioTrack) && !props.isLoading ? (
      <View style={styles.iconContainer}>
        {!props.videoTrack && (
          <Image
            style={styles.icon}
            source={require('../../assets/camera-off.png')}
          />
        )}
        {!props.audioTrack && (
          <Image
            style={styles.icon}
            source={require('../../assets/mic-off.png')}
          />
        )}
      </View>
    ) : null;
  }, [props.videoTrack, props.audioTrack, props.isLoading]);

  const loadingComponent = useMemo(() => {
    return props.isLoading ? (
      <Text style={styles.loading}>Loading...</Text>
    ) : null;
  }, [props.isLoading]);

  let typeSpecificStyle: ViewStyle | null = null;
  switch (props.type) {
    case TileType.Half:
      typeSpecificStyle =
        orientation === Orientation.Portrait
          ? styles.containerHalfPortrait
          : styles.containerHalfLandscape;
      break;
    case TileType.Full:
      typeSpecificStyle =
        orientation === Orientation.Portrait
          ? styles.containerFullPortrait
          : styles.containerFullLandscape;
      break;
  }
  return (
    <View
      style={[
        styles.container,
        (props.isLoading || !props.videoTrack) &&
          styles.containerLoadingOrNotShowingVideo,
        typeSpecificStyle,
      ]}
    >
      {touchableMediaComponent}
      {loadingComponent}
      {muteOverlayComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    aspectRatio: 1,
  },
  containerHalfPortrait: {
    width: '50%',
  },
  containerHalfLandscape: {
    height: '50%',
  },
  containerFullPortrait: {
    width: '100%',
  },
  containerFullLandscape: {
    height: '100%',
  },
  containerLoadingOrNotShowingVideo: {
    backgroundColor: theme.colors.blueDark,
  },
  media: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  loading: {
    color: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 4,
  },
});
