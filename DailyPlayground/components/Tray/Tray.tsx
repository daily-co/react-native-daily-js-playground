import React from 'react';
import {StyleSheet, View, TouchableHighlight, Text} from 'react-native';

type Props = {
  onClickLeaveCall: () => void;
  disabled: boolean;
};

export default function Tray(props: Props) {
  return (
    <View style={styles.container}>
      <TouchableHighlight
        onPress={props.onClickLeaveCall}
        style={styles.touchable}>
        <View style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>x</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    borderRadius: 40,
  },
  leaveButton: {
    backgroundColor: '#d81a1a',
    width: 80,
    height: 80,
    borderRadius: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#ffffff',
    fontWeight: '200',
    fontSize: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    position: 'relative',
    top: -3,
    left: 1,
  },
});
