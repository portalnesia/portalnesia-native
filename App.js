import React, { useState } from 'react';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import { StyleSheet,LogBox,useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import 'moment/locale/id';
import {StatusBar} from 'expo-status-bar'
import {
	Inter_300Light,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './provider/AuthProvider';
import {AppearanceProvider} from 'react-native-appearance'
import remoteConfig from '@react-native-firebase/remote-config'
//import AsyncStorage from '@react-native-async-storage/async-storage'

LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

export default function App() {
	const [isLoadingComplete, setLoadingComplete] = useState(false);
	/*const [tema,setTema]=React.useState("auto");
	const colorScheme=useColorScheme();

	const theme=React.useMemo(()=>{
		if(colorScheme==='dark' && tema === 'auto' || tema === 'dark') return 'dark';
		return 'light';
	},[colorScheme,tema])

	React.useEffect(()=>{
		(async function(){
			const tm = await AsyncStorage.getItem('theme')
			if(tm !== null) setTema(tm);
		})();
	},[])*/

	if (!isLoadingComplete) {
		return (
			<>
			<StatusBar style="light" translucent animated />
			<AppLoading
				startAsync={loadResourcesAsync}
				onError={(err)=>handleLoadingError(err,setLoadingComplete)}
				onFinish={() => handleFinishLoading(setLoadingComplete)}
			/>
			</>
		);
	} else {
		return (
			<SafeAreaView style={[styles.container]}>
				<AppearanceProvider>
					<AuthProvider>
						<AppNavigator />
					</AuthProvider>
				</AppearanceProvider>
				
			</SafeAreaView>
		);
	}
}

async function loadResourcesAsync() {
	// load all resources such as images, fonts, etc.
	await Promise.all([
		Asset.loadAsync([
			require('./assets/icon.png'),
			require('./assets/splash.png'),
			require('./assets/avatar.png'),
			require('./assets/landing.png'),
			require('./assets/transparent.png'),
			require('./assets/login.png'),
			require('./assets/forget.png'),
			require('./assets/register.png'),
		]),
		Font.loadAsync({
			Inter_300Light,
			Inter_Regular: Inter_400Regular,
			Inter_Medium:Inter_500Medium,
			Inter_SemiBold: Inter_600SemiBold,
			Inter_Bold: Inter_700Bold,
		}),
		remoteConfig().setDefaults({tuner_enabled:false})
		.then(()=>remoteConfig().fetchAndActivate())
	]);
}

function handleLoadingError(error,setLoadingComplete) {
	// In this case, you might want to report the error to your error reporting
	// service, for example Sentry
	console.log(error);
	setLoadingComplete(true);
}

function handleFinishLoading(setLoadingComplete) {
	setLoadingComplete(true);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
