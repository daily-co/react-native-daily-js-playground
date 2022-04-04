import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import theme from '../../theme';
import { useOrientation, Orientation } from '../../useOrientation';
import { robotID } from '../../utils';

type Props = {
  disabled?: boolean;
  onPress: () => void;
  muted?: boolean;
  robotId?: string;
  text: string;
  type: 'mic' | 'camera' | 'leave';
};
export default function TrayButton({
  disabled = false,
  onPress,
  muted = false,
  robotId = '',
  text,
  type,
}: Props) {
  const orientation = useOrientation();

  let source: NodeRequire = require('../../../assets/leave.png');
  const isLeaveButton: boolean = type === 'leave';
  if (isLeaveButton) {
    robotId = 'robots-leave-button';
  } else if (type === 'camera') {
    robotId = `robots-btn-cam-${muted ? 'mute' : 'unmute'}`;
    source = muted
      ? require('../../../assets/camera-off.png')
      : require('../../../assets/camera.png');
  } else if (type === 'mic') {
    robotId = `robots-btn-mic-${muted ? 'mute' : 'unmute'}`;
    source = muted
      ? require('../../../assets/mic-off.png')
      : require('../../../assets/mic.png');
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      disabled={disabled}
      {...robotID(robotId)}
    >
      <View style={styles.controlContainer}>
        <Image
          style={[
            styles.iconBase,
            orientation === Orientation.Portrait
              ? styles.iconPortrait
              : styles.iconLandscape,
            disabled && styles.disabled,
            isLeaveButton && styles.iconLeave,
          ]}
          source={source}
        />
        <Text
          style={[
            styles.controlText,
            (muted || isLeaveButton) && styles.offText,
          ]}
        >
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  iconBase: {
    height: 32,
    width: 32,
    backgroundColor: theme.colors.greyLight,
  },
  iconPortrait: {
    marginHorizontal: 16,
  },
  iconLandscape: {
    marginTop: 16,
  },
  iconLeave: {
    height: 28,
    width: 36,
  },
  disabled: {
    opacity: 0.6,
  },
  controlContainer: {
    alignItems: 'center',
  },
  controlText: {
    fontWeight: '500',
    paddingTop: 4,
    color: theme.colors.blueDark,
  },
  offText: {
    color: theme.colors.red,
  },
});
