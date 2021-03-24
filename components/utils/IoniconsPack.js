import React from 'react';
import { StyleSheet } from 'react-native';
import {Ionicons} from '@expo/vector-icons'

export const IoniconsPack = {
    name: 'ionicons',
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
    toReactElement: (props) => IonIcon({ name, ...props }),
});

function IonIcon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <Ionicons name={name} size={height} color={tintColor} iconStyle={iconStyle} />
    );
}