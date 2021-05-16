import { useTheme } from '@ui-kitten/components'
import React from 'react'

type WithThemeProps = {
    theme: Record<string,string>
}

export default function withTheme<P extends WithThemeProps>(Component: React.ComponentType<P>){
    return function(props: P){
        const theme = useTheme();
        return <Component {...props} theme={theme} />
    }
}