import React from 'react'
import {View} from 'react-native'
import {AuthContext} from '@pn/provider/AuthProvider'
import LottieView from 'lottie-react-native'

export interface NotFoundProps {
    children?: React.ReactText;
    status?: number
}

function NotFound({children,status=404}: NotFoundProps){
    const auth = React.useContext(AuthContext);
	const {theme:selectedTheme} = auth;

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
export default React.memo(NotFound);