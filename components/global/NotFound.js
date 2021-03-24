import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import Image from '@pn/components/global/Image'

export default function NotFound({children}){
    const {width} = useWindowDimensions()

    return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <Image source={require('@pn/assets/404.png')} fullSize />
            {children ? (
                <View style={{marginTop:10}}>{children}</View>
            ) : null}
        </View>
    )
}