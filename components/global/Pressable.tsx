import React from 'react'
import {Pressable as Presss, PressableProps as PresssProps} from 'react-native'
import {useTheme} from '@ui-kitten/components'

export interface PressableProps extends PresssProps {
    default?: boolean
}

export default function Pressable(props: PressableProps) {
    const theme = useTheme();
    return <Presss {...props} {...(props.default ? {} : {android_ripple:{color:theme['riple-color'],borderless:false}})} />
}