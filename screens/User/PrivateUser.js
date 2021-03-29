import React from 'react'
import {Layout as Lay,Text} from '@ui-kitten/components'

export default function RenderPrivate({data}){
    return (
        <Lay style={{padding:15,height:winHeight,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This account is private</Text>
            <Text>{`Follow @${data?.users?.username} to see this account`}</Text>
        </Lay>
    )
}

export const RenderMediaPrivate=({data})=>{
    return (
        <Lay style={{padding:15,height:winHeight,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This media is private</Text>
            <Text>{`Follow @${data?.users?.username} to see this media`}</Text>
        </Lay>
    )
}

export const RenderSuspend=()=>{
    return (
        <Lay style={{padding:15,height:winHeight,alignItems:'center'}}>
            <Text style={{fontSize:25}}>This account is suspended</Text>
        </Lay>
    )
}