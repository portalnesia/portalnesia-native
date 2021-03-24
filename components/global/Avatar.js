import React from 'react'
import UserAvatar from 'react-native-user-avatar'
import {Image,View} from 'react-native'

const Avatar=({name,src,size,avatar,customStyle})=>{
    if(avatar) {
        return (
            <View style={{flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:-(size/30),height:size,width:size,...customStyle}}>
                <Image source={require('@pn/assets/avatar.png')} style={{borderRadius:size * 0.5,width:size,height:size}} />
            </View>
        )
    }
    else return <UserAvatar name={name} src={src} size={size} />
}

Avatar.defaultProps={
    size:32,
    avatar:false,
    customStyle:{}
}
export default Avatar