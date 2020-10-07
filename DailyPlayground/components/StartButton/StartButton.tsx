import React from 'react';
import { TouchableHighlight, View, StyleSheet, Text } from 'react-native';

type Props = {
  onPress: () => void;
  disabled: boolean;
  starting: boolean;
};

const StartButton = (props: Props) => {
  return (
    <TouchableHighlight onPress={props.onPress} disabled={props.disabled}>
      <View style={styles.button}>
        <Text style={styles.text}>
          {props.starting ? 'Starting...' : 'Start call'}
        </Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  text: {
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
