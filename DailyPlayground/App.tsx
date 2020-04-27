import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  Button,
  TouchableHighlight,
  View,
} from 'react-native';
import DailyIframe, {
  mediaDevices,
  RTCView,
} from '@daily-co/react-native-daily-js';

declare const global: {HermesInternal: null | {}};

const App = () => {
  const [localStream, setLocalStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (global as any)['DailyIframe'] = DailyIframe;
    (global as any)['mediaDevices'] = mediaDevices;
    (global as any)['RTCView'] = RTCView;
  }, []);

  const onPressStart = useCallback(async () => {
    setIsLoading(true);
    setLocalStream(await mediaDevices.getUserMedia({video: true}));
    setIsLoading(false);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {localStream ? (
          <RTCView
            streamURL={(localStream as any).toURL()}
            mirror={true}
            style={styles.localVideoView}></RTCView>
        ) : (
          <TouchableHighlight onPress={onPressStart} disabled={isLoading}>
            <View style={styles.startButton}>
              <Text>Tap to start a call</Text>
            </View>
          </TouchableHighlight>
        )}
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
  localVideoView: {width: 300, height: 500, backgroundColor: 'black'},
});

export default App;
