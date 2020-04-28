import React from 'react';
import {TouchableHighlight, View, StyleSheet, Text} from 'react-native';

type Props = {
  onPress: () => void;
  disabled: boolean;
};

const StartButton = (props: Props) => {
  return (
    <TouchableHighlight onPress={props.onPress} disabled={props.disabled}>
      <View style={styles.startButton}>
        <Text>Tap to start a call</Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  startButton: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica Neue',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#4a4a4a',
  },
});

export default StartButton;
