import React from 'react'
import {Pressable,PressableProps,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import withTooltip from '../HOC/withTooltip'

export interface TopActionProps extends PressableProps {
    icon: (props?: {style:Record<string,any>})=>JSX.Element
}

const TopAction = React.forwardRef<InstanceType<typeof View>,TopActionProps>((props: TopActionProps,ref)=>{
    const {icon,...other} = props
    const theme = useTheme();
    return (
        <View style={{borderRadius:20,overflow:'hidden'}}>
            <Pressable ref={ref} android_ripple={{color:theme['riple-color'],borderless:false}} style={{padding:8}} {...other}>
                {icon({style:{width:24,height:24,backgroundColor:'transparent',borderWidth:0,flex:0,tintColor:theme['text-basic-color']}})}
            </Pressable>
        </View>
    )
})

export default withTooltip(TopAction)