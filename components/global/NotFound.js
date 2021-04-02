import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import Image from '@pn/components/global/Image'
import {AuthContext} from '@pn/provider/AuthProvider'
import LottieView from 'lottie-react-native'

export default function NotFound({children,status=404}){
    const auth = React.useContext(AuthContext);
	const {theme:selectedTheme} = auth;
    const {width} = useWindowDimensions()

    const animSource=React.useMemo(()=>{
        if(status!==404) {
            if(selectedTheme === 'dark') return require('@pn/assets/animation/error-dark.json')
            else return require('@pn/assets/animation/error-light.json')
        } else {
            if(selectedTheme === 'dark') return require('@pn/assets/animation/404dark.json')
            else return require('@pn/assets/animation/404light.json')
        }
    },[status,selectedTheme])
    return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <LottieView source={animSource} autoPlay loop />
            
            {children ? (
                <View style={{position:'absolute',bottom:80,paddingHorizontal:15}}>{children}</View>
            ) : null}
        </View>
    )
}