import React from 'react';
import { StyleSheet } from 'react-native';
import {FontAwesome5} from '@expo/vector-icons'

export const FontAwesomeIconsPack = {
    name: 'font_awesome',
    icons: createIconsMap(),
};

function createIconsMap() {
    return new Proxy({}, {
      get(target, name) {
        return IconProvider(name);
      },
    });
  }

const IconProvider = (name) => ({
    toReactElement: (props) => FontAwesomeIcon({ name, ...props }),
  });

function FontAwesomeIcon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <FontAwesome5 name={name} size={height} color={tintColor} iconStyle={iconStyle} />
    );
  }