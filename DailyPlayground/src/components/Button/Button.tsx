import React, { useRef } from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import theme from '../../theme';
import api from '../../api';
import { robotID } from '../../utils';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  label: string;
  type?: string;
  robotId?: string;
};

const Button = ({
  onPress,
  disabled = false,
  label,
  robotId,
  type = 'primary',
}: Props) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  const animatedScale = scaleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  const onPressIn = () => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
      {...robotID(robotId)}
    >
      <Animated.View
        style={[
          styles.button,
          type === 'primary' ? styles.primary : styles.secondary,
          disabled && styles.disabled,
          {
            transform: [{ scaleX: animatedScale }, { scaleY: animatedScale }],
          },
        ]}
      >
        <Text style={styles.text}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: theme.colors.green,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  disabled: {
    backgroundColor: theme.colors.greyLight,
  },
  text: {
    fontFamily: theme.fontFamily.body,
    color: theme.colors.blueDark,
    fontSize: theme.fontSize.base,
    fontWeight: '700',
  },
});

export default Button;
