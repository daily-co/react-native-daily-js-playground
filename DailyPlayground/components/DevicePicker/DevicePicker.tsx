import React, { useEffect, useState, useCallback } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useCallObject } from '../../useCallObject';
import { MediaDeviceInfo } from '@daily-co/react-native-daily-js';

export default function DevicePicker() {
  const callObject = useCallObject();
  const [mics, setMics] = useState<string[]>([]);
  const [cameras, setCameras] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<string[]>([]);

  const setDevices = useCallback((mediaDeviceInfos: MediaDeviceInfo[]) => {
    const micInfos = mediaDeviceInfos.filter(
      (mdi) => mdi.kind === 'audioinput'
    );
    const cameraInfos = mediaDeviceInfos.filter(
      (mdi) => mdi.kind === 'videoinput'
    );
    const speakerInfos = mediaDeviceInfos.filter(
      (mdi) => mdi.kind === 'audiooutput'
    );
    setMics(micInfos.map((micInfo) => micInfo.label));
    setCameras(cameraInfos.map((cameraInfo) => cameraInfo.label));
    setSpeakers(speakerInfos.map((speakerInfo) => speakerInfo.label));
  }, []);

  useEffect(() => {
    if (!callObject) {
      return;
    }
    callObject.enumerateDevices().then((devices) => {
      setDevices(devices.devices);
    });
  }, [callObject, setDevices]);

  return (
    <View style={styles.container}>
      <Text>Mics:</Text>
      <Text>{mics.join(',')}</Text>
      <Text>{'\n'}</Text>

      <Text>Cameras:</Text>
      <Text>{cameras.join(',')}</Text>
      <Text>{'\n'}</Text>

      <Text>Speakers:</Text>
      <Text>{speakers.join(',')}</Text>
      <Text>{'\n'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
