import React from 'react'
import {Tooltip} from '@ui-kitten/components'
import { GestureResponderEvent } from 'react-native'

type WithTooltipProps = {
    /**
     * Enable tooltip on longpress
     */
    tooltip?: string,
}

export default function withTooltip<P>(Component: React.ComponentType<P>){
    return function(props: P & WithTooltipProps){
        const {tooltip} = props
        const [visible,setVisible]=React.useState(false);
        
        const onPress=()=>setVisible(true)

        const render=()=> <Component {...props} onLongPress={onPress} />

        if(tooltip) {
            return (
                <Tooltip
                    anchor={render}
                    visible={visible}
                    onBackdropPress={()=>setVisible(false)}
                >
                    {tooltip}
                </Tooltip>
            )
        } else {
            return <Component {...props} onLongPress={onPress} />
        }
    }
}