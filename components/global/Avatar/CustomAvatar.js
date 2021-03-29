import React from 'react';
import {View} from 'react-native';

const CustomAvatar = (props) => {
  const {
    size,
    component,
  } = props;

  const containerStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(size / 20),
    height: size,
    width: size,
  };

  return (
    <View style={containerStyle}>
      {component}
    </View>
  );
};
export default CustomAvatar;
