import React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'
import {Tooltip as Tt,Icon,useTheme} from '@ui-kitten/components'
import Pressable from './Pressable'

const BtnIcon = (props: {style:Record<string,any>,name:string,pack?:string}) => <Icon {...props} />

export interface TooltipProps {
    name: string;
    pack?: string;
    style?:StyleProp<ViewStyle>;
    pressableStyle?:StyleProp<ViewStyle>;
    tooltip: string;
    size?: number
}

const defaultSize=24;

const defaultViewStyle = (size?:number):StyleProp<ViewStyle>=>({
    borderRadius:(size||defaultSize)+(4*2)/2,
    overflow:'hidden'
})

const PressableStyle={
    padding:4
}

export default function Tooltip(props: TooltipProps){
    const {name,pack,style,tooltip,size,pressableStyle} = props;
    const theme=useTheme();

    const [visible,setVisible]=React.useState(false);

    const onPress=()=>setVisible(true)

    const defaultStyle=React.useMemo(()=>{
        return {width:size||defaultSize,height:size||defaultSize,tintColor:theme['text-hint-color']}
    },[theme,size])

    const render=()=>(
        <View style={[style,defaultViewStyle(size)]}>
            <Pressable style={[pressableStyle,PressableStyle]} onPress={onPress}>
                <Icon name={name} pack={pack} style={defaultStyle} />
            </Pressable>
        </View>
    )

    return (
        <Tt
            anchor={render}
            visible={visible}
            onBackdropPress={()=>setVisible(false)}
        >
            {tooltip}
        </Tt>
    )
}