import React from 'react';
import {Text} from 'react-native';

type Props = {
  roomUrl: string;
};

const CallPanel = (props: Props) => {
  return <Text>{props.roomUrl}</Text>;
};

export default CallPanel;
