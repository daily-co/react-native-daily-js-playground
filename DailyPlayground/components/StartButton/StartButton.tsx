import React from 'react';
import Button from '../Button/Button';
import { StyleSheet, View } from 'react-native';

type Props = {
  onPress: () => void;
  disabled: boolean;
  starting: boolean;
  robotId?: string;
};

const StartButton = ({ onPress, disabled, starting }: Props) => {
  return (
    <View style={styles.container}>
      <Button
        onPress={onPress}
        disabled={disabled}
        label={starting ? 'Joining...' : 'Join call'}
        robotId={'robots-start-call'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
});

export default StartButton;
