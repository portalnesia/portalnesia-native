import React from 'react'
import { ViewStyle } from 'react-native';

export interface AvatarProps {
    name?: string;
    src?: string;
    size: number;
    avatar?: boolean,
    customStyle?: ViewStyle;
    style?: ViewStyle;
    component?: React.ReactNode
}

export default function Avatar(props: AvatarProps): JSX.Element