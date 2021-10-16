import React from 'react'
import {Dimensions} from 'react-native'
import {Tooltip} from '@ui-kitten/components'

const {width}=Dimensions.get('window')

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
        const handleVisible=React.useCallback(()=>setVisible(false),[])

        if(tooltip) {
            return (
                <Tooltip
                    anchor={render}
                    visible={visible}
                    onBackdropPress={handleVisible}
                    style={{maxWidth:width-100}}
                >
                    {tooltip}
                </Tooltip>
            )
        } else {
            return <Component {...props} />
        }
    }
}