import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, StyleSheet, View, TouchableHighlight } from 'react-native';
import { useCallObject } from '../../useCallObject';
import { MediaDeviceInfo } from '@daily-co/react-native-daily-js';

type DeviceInfo = {
  label: string;
  id: string;
};

function deviceButtons(devices: DeviceInfo[], onPress: (id: string) => void) {
  return devices.map((d) => {
    return (
      <TouchableHighlight onPress={() => onPress(d.id)}>
        <View style={styles.deviceButton}>
          <Text style={styles.deviceButtonText} key={d.id + '-label'}>
            {d.label}
          </Text>
        </View>
      </TouchableHighlight>
    );
  });
}

export default function DevicePicker() {
  const callObject = useCallObject();
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([]);

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
    setMics(
      micInfos.map((micInfo) => {
        return { label: micInfo.label, id: micInfo.deviceId };
      })
    );
    setCameras(
      cameraInfos.map((cameraInfo) => {
        return { label: cameraInfo.label, id: cameraInfo.deviceId };
      })
    );
    setSpeakers(
      speakerInfos.map((speakerInfo) => {
        return { label: speakerInfo.label, id: speakerInfo.deviceId };
      })
    );
  }, []);

  useEffect(() => {
    if (!callObject) {
      return;
    }
    callObject.enumerateDevices().then((devices) => {
      setDevices(devices.devices);
    });
  }, [callObject, setDevices]);

  const micButtons = useMemo(() => {
    if (!callObject) {
      return;
    }
    return deviceButtons(mics, (id) => {
      console.log(`callObject?.setInputDevices({ audioDeviceId: ${id} })`);
      // callObject?.setInputDevices({ audioDeviceId: id });
    });
  }, [mics, callObject]);

  const cameraButtons = useMemo(() => {
    if (!callObject) {
      return;
    }
    return deviceButtons(cameras, (id) => {
      console.log(`callObject?.setInputDevices({ videoDeviceId: ${id} })`);
      // callObject?.setInputDevices({ videoDeviceId: id });
    });
  }, [cameras, callObject]);

  const speakerButtons = useMemo(() => {
    if (!callObject) {
      return;
    }
    return deviceButtons(speakers, (id) => {
      console.log(`callObject?.setOutputDevice({ id: ${id} })`);
      // callObject?.setOutputDevice({ id });
    });
  }, [speakers, callObject]);

  return (
    <View style={styles.container}>
      <Text>Mics:</Text>
      {micButtons}
      <Text>{'\n'}</Text>

      <Text>Cameras:</Text>
      {cameraButtons}
      <Text>{'\n'}</Text>

      <Text>Speakers:</Text>
      {speakerButtons}
      <Text>{'\n'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  deviceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deviceButtonText: {
    fontSize: 20,
  },
});
