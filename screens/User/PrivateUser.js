import React from 'react'
import {Dimensions} from 'react-native'
import {Layout as Lay,Text} from '@ui-kitten/components'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

export default function RenderPrivate({data}){
    return (
        <Lay style={{padding:15,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This account is private</Text>
            <Text>{`Follow @${data?.users?.username} to see this account`}</Text>
        </Lay>
    )
}

export const RenderMediaPrivate=({data})=>{
    return (
        <Lay style={{padding:15,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This media is private</Text>
            <Text>{`Follow @${data?.users?.username} to see this media`}</Text>
        </Lay>
    )
}

export const RenderSuspend=()=>{
    return (
        <Lay style={{padding:15,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This account is suspended</Text>
        </Lay>
    )
}