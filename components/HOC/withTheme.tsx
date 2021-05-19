import { useTheme } from '@ui-kitten/components'
import React from 'react'

export default function withTheme<P>(Component: React.ComponentClass<P>){
    type ComponentInstance = InstanceType<typeof Component>
    type WrapperComponent = Omit<P,"theme"> & {
        ref?: React.LegacyRef<ComponentInstance>
        theme?: Record<string,string>
    }

    return function(props: WrapperComponent){
        const {ref,...other}=props;
        const theme = useTheme();
        return <Component {...other as P} ref={ref} theme={theme} />
    }
}