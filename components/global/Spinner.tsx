import { useTheme } from '@ui-kitten/components'
import React from 'react'
import {ActivityIndicator,ActivityIndicatorProps} from 'react-native'


function Spinner(props: ActivityIndicatorProps) {
    const theme = useTheme();

    return <ActivityIndicator color={theme['color-indicator-bar']} {...props} />
}

export default React.memo(Spinner);