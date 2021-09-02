import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../../theme';

type Props = {
  header: string;
  detail?: string | null;
  isError: boolean;
};

export default function CallMessage(props: Props) {
  return (
    <View style={[styles.container, props.isError && styles.errorContainer]}>
      <View style={styles.textRow}>
        {props.isError && (
          <Image source={require('../../../assets/error.png')} />
        )}
        <Text
          style={[
            styles.text,
            styles.headerText,
            props.isError ? styles.errorText : {},
          ]}
        >
          {props.header}
        </Text>
      </View>
      {props.detail && <Text style={styles.text}>{props.detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  errorContainer: {
    backgroundColor: theme.colors.greyLightest,
  },
  text: {
    fontFamily: theme.fontFamily.body,
    fontSize: theme.fontSize.base,
    textAlign: 'center',
    color: theme.colors.blueDark,
  },
  headerText: {
    fontWeight: 'bold',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  errorText: {
    color: theme.colors.red,
    marginLeft: 8,
  },
});
