import React, { useState } from 'react';
import { StyleSheet, Button, View, Modal, Text } from 'react-native';

export default function DevicePicker() {
  const [isPickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={isPickerOpen}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <View style={styles.closeButton}>
              <Button
                title="Close"
                color="#000"
                onPress={() => {
                  setPickerOpen(false);
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.openButton}>
        <Button
          title="Devices"
          color="#fff"
          onPress={() => {
            setPickerOpen(true);
          }}
        ></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  openButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  modalWrapper: {
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  modalContent: {
    height: 200,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
