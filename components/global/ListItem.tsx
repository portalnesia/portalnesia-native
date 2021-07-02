import React from 'react'
import {View, ViewStyle,TextStyle} from 'react-native'
import {useTheme,Text} from '@ui-kitten/components'

import Pressable,{PressableProps} from './Pressable'

type StyleType = Record<string,any>
export type PropsType = {
    style: StyleType
}

const titleStyle=(theme: Record<string,string>): TextStyle =>({
    color:theme['text-basic-color'],
    fontSize:13,
    fontWeight:"600",
    fontFamily:'Inter_Regular',
    marginHorizontal:8,
    textAlign:'left'
})

const descStyle=(theme: Record<string,string>): TextStyle =>({
    color:theme['text-hint-color'],
    fontSize:12,
    fontWeight:"400",
    fontFamily:'Inter_Regular',
    marginHorizontal:8,
    textAlign:'left'
})

const accessoryStyle=(theme: Record<string,string>): Record<string,any> =>({
    tintColor:theme['text-hint-color'],
    backgroundColor:'transparent',
    marginHorizontal:8,
    flex:0,
    borderWidth:0,
    width:24,
    height:24
})

export interface ListItemProps extends PressableProps {
    accessoryLeft?:(props?: {style:Record<string,any>})=>JSX.Element;
    accessoryRight?:(props?: {style:Record<string,any>})=>JSX.Element;
    style?:ViewStyle;
    title: string | ((props?: PropsType)=>JSX.Element);
    description?: string | ((props?: PropsType)=>JSX.Element);
    rootStyle?:ViewStyle
}

function ListItem(props: ListItemProps){
    const {accessoryLeft,accessoryRight,title,description,rootStyle,...other} = props
    const theme=useTheme();

    return (
        <Pressable {...other}>
            <View style={[{paddingVertical:12,paddingHorizontal:8,flexDirection:'row',alignItems:'center'},rootStyle]}>
                {accessoryLeft && accessoryLeft({style: accessoryStyle(theme)})}
                <View style={{flex:1,flexShrink:1,flexBasis:0}}>
                    {typeof title === 'string' ? (
                        <Text style={titleStyle(theme)}>{title}</Text>
                    ) : title({style: titleStyle(theme)})}

                    {typeof description === 'undefined' ? null :
                    typeof description === 'string' ? (
                        <Text style={descStyle(theme)}>{description}</Text>
                    ) : description({style: descStyle(theme)})}
                </View>
                {accessoryRight && accessoryRight({style: accessoryStyle(theme)})}
            </View>
        </Pressable>
    )
}
export default React.memo(ListItem);