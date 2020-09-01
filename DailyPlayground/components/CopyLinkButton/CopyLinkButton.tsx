import React, { useState, useCallback } from 'react';
import { TouchableHighlight, View, Text, StyleSheet } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

type Props = {
  roomUrl: string;
};

const CopyLinkButton = (props: Props) => {
  const [showCopied, setShowCopied] = useState(false);

  const copy = useCallback(() => {
    Clipboard.setString(props.roomUrl);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 1000);
  }, [props.roomUrl]);

  return (
    <TouchableHighlight onPress={copy} disabled={showCopied}>
      <View style={styles.button}>
        <Text style={styles.text}>{showCopied ? 'Copied!' : 'Copy link'}</Text>
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

export default CopyLinkButton;
