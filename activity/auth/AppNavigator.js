import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';
import {useTheme} from '@ui-kitten/components'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import analytics from '@react-native-firebase/analytics'
import useRootNavigation from './useRootNavigation'

import Login from '../../screens/auth/Login'
import Register from '../../screens/auth/Register'
import Authentication from '../../screens/auth/Authentication'
import ForgetPassword from '../../screens/auth/ForgetPassword'
import ForgetPasswordForm from '../../screens/auth/ForgetPasswordForm'
import ReportScreen from '../../screens/ReportScreen'
import ReportModal from '../../screens/Modal/ReportModal'
import { AuthContext } from '../../provider/Context';

const MainStack = createStackNavigator();



export default function(){
    const {navigationRef} = useRootNavigation();
    const routeNameRef = React.useRef(null)
    const auth = useContext(AuthContext);
	const {theme:selectedTheme} = auth;
	const theme=useTheme()

    function onReady(){
		routeNameRef.current = navigationRef.current.getCurrentRoute().name
        setStatusBarStyle(selectedTheme==='light' ? "dark" : "light");
        setStatusBarBackgroundColor(theme['background-basic-color-1']);
	}

	async function onStateChange(){
		const prevRouteName = routeNameRef.current;
		const currentRouteName = navigationRef.current.getCurrentRoute().name
		if(prevRouteName !== currentRouteName && !__DEV__) {
			await analytics().logScreenView({
				screen_class: currentRouteName,
				screen_name: currentRouteName
			})
		}
	}

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={onReady}
            onStateChange={onStateChange}
        >
            <MainStack.Navigator initialRouteName="Login" screenOptions={{
                headerShown:false,
                gestureEnabled:true,
                ...TransitionPresets.SlideFromRightIOS
            }}>
                <MainStack.Screen name="Login" component={Login} />
                <MainStack.Screen name="Register" component={Register} />
                <MainStack.Screen name="Authentication" component={Authentication} />
                <MainStack.Screen name="ForgetPassword" component={ForgetPassword} />
                <MainStack.Screen name="ForgetPasswordForm" component={ForgetPasswordForm} />
                <MainStack.Screen name="ReportModal" component={ReportModal} />
                <MainStack.Screen name="ReportScreen" component={ReportScreen} />
            </MainStack.Navigator>
        </NavigationContainer>
    )
}