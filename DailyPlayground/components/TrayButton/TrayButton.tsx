import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import theme from '../../theme';

type Props = {
  disabled?: boolean;
  onPress: () => void;
  muted?: boolean;
  text: string;
  type: 'mic' | 'camera' | 'leave';
};
export default function TrayButton({
  disabled = false,
  onPress,
  muted = false,
  text,
  type,
}: Props) {
  let source: NodeRequire = require('../../assets/leave.png');
  if (type === 'camera') {
    source = muted
      ? require('../../assets/camera-off.png')
      : require('../../assets/camera.png');
  } else if (type === 'mic') {
    source = muted
      ? require('../../assets/camera-off.png')
      : require('../../assets/camera.png');
  }

  const isLeaveButton: boolean = type === 'leave';

  return (
    <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
      <View style={styles.controlContainer}>
        <Image
          style={[
            styles.icon,
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
  icon: {
    height: 32,
    width: 32,
    marginHorizontal: 16,
    backgroundColor: theme.colors.greyLight,
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
