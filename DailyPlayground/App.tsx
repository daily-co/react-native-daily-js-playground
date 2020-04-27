import React, {useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  Button,
  TouchableHighlight,
  View,
} from 'react-native';
import DailyIframe, {mediaDevices} from '@daily-co/react-native-daily-js';

declare const global: {HermesInternal: null | {}};

const App = () => {
  useEffect(() => {
    (global as any)['DailyIframe'] = DailyIframe;
  }, []);

  const onPressStart = useCallback(() => {
    console.log('start pressed!');
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <TouchableHighlight onPress={onPressStart}>
          <View style={styles.startButton}>
            <Text>Tap to start a call</Text>
          </View>
        </TouchableHighlight>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4a4a4a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
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

export default App;
