import React from 'react'
import {StyleProp, View, ViewStyle,Dimensions} from 'react-native'
import {Tooltip as Tt,Icon,useTheme,TooltipProps as TtProps} from '@ui-kitten/components'
import Pressable from './Pressable'

const {width}=Dimensions.get('window')

export interface TooltipProps {
    name: string;
    pack?: string;
    style?:StyleProp<ViewStyle>;
    pressableStyle?:StyleProp<ViewStyle>;
    tooltip: string;
    size?: number
    tooltipProps?: TtProps
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
    const {name,pack,style,tooltip,size,pressableStyle,tooltipProps} = props;
    const theme=useTheme();

    const [visible,setVisible]=React.useState(false);

    const onPress=React.useCallback(()=>setVisible(true),[])

    const defaultStyle=React.useMemo(()=>{
        return {width:size||defaultSize,height:size||defaultSize,tintColor:theme['text-hint-color']}
    },[theme,size])

    const render=React.useCallback(()=>(
        <View style={[style,defaultViewStyle(size)]}>
            <Pressable style={[pressableStyle,PressableStyle]} onPress={onPress}>
                <Icon name={name} pack={pack} style={defaultStyle} />
            </Pressable>
        </View>
    ),[defaultStyle,pressableStyle,name,pack,size])

    //{(props)=><Text {...props}>{tooltip}</Text>}
    return (
        <Tt
            {...tooltipProps}
            anchor={render}
            visible={visible}
            onBackdropPress={()=>setVisible(false)}
            style={{maxWidth:width-100}}
        >
            {tooltip}
        </Tt>
    )
}