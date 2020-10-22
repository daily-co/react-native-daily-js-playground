import React from 'react';
import Button from '../Button/Button';

type Props = {
  onPress: () => void;
  disabled: boolean;
  starting: boolean;
};

const StartButton = ({ onPress, disabled, starting }: Props) => {
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      label={starting ? 'Joining...' : 'Join call'}
    />
  );
};

export default StartButton;
