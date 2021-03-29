import React from 'react'
import {Image,View} from 'react-native'
import TextAvatar from './Avatar/TextAvatar'
import ImageAvatar from './Avatar/ImageAvatar'
import CustomAvatar from './Avatar/CustomAvatar'
import {
    getContainerStyle,
    generateBackgroundStyle,
} from './Avatar/helpers';

const UserAvatar = (props) => {
    const {
      name,
      src,
      bgColor,
      bgColors,
      textColor,
      size,
      imageStyle,
      style,
      borderRadius,
      component,
    } = props;
  
    // Validations
    if (typeof (size) === 'string') {
      console.warn('size prop should be a number');
      size = parseInt(size);
    }
  
    return (
      <View style={[
        generateBackgroundStyle(name, bgColor, bgColors),
        getContainerStyle(size, src, borderRadius),
        style]}
      >
        {component ? (
            <CustomAvatar size={size} component={component} />
        ) : src ? (
          <ImageAvatar src={src} size={size} imageStyle={imageStyle} />
        ) : <TextAvatar textColor={textColor} size={size} name={name} /> }
      </View>
    );
};
  
UserAvatar.defaultProps = {
    size: 32,
    textColor: '#fff',
    name: 'Portal Nesia',
    bgColors: [ // from https://flatuicolors.com/
        '#2ecc71', // emerald
        '#3498db', // peter river
        '#8e44ad', // wisteria
        '#e67e22', // carrot
        '#e74c3c', // alizarin
        '#1abc9c', // turquoise
        '#2c3e50', // midnight blue,
        '#2f6f4e'
    ],
};

const Avatar=({name,src,size,avatar,customStyle={},component,...other})=>{
    if(avatar) {
        return (
            <View style={{flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:-(size/30),height:size,width:size,...customStyle}}>
                <Image source={require('@pn/assets/avatar.png')} style={{borderRadius:size * 0.5,width:size,height:size}} />
            </View>
        )
    }
    else return <UserAvatar name={name} src={src} size={size} component={component} {...other} />
}

Avatar.defaultProps={
    size:32,
    avatar:false,
    customStyle:{}
}
export default Avatar