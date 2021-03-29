import React from 'react';
import {View, Text} from 'react-native';
import {abbr} from './helpers';

const TextAvatar = (props) => {
  const {
    name,
    size,
    textColor,
  } = props;

  const textContainerStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(size / 20),
    height: size,
    width: size,
  };

  return (
    <View style={textContainerStyle}>
      <Text
        style={{
          color: textColor,
          fontSize: size / 2.5,
        }}
        adjustsFontSizeToFit={true}
      >
        {abbr(name)}
      </Text>
    </View>
  );
};

export default TextAvatar;
