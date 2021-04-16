import React from 'react'
import {Pressable,PressableProps,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'

export interface TopActionProps extends PressableProps {
    icon: (props?: {style:Record<string,any>})=>JSX.Element
}

export default function TopAction(props: TopActionProps){
    const {icon,...other} = props
    const theme = useTheme();
    return (
        <View style={{borderRadius:14,overflow:'hidden',marginHorizontal:4}}>
            <Pressable android_ripple={{color:theme['riple-color'],borderless:false}} style={{padding:4}} {...other}>
                {icon({style:{width:24,height:24,backgroundColor:'transparent',borderWidth:0,flex:0,tintColor:theme['text-basic-color']}})}
            </Pressable>
        </View>
    )
}