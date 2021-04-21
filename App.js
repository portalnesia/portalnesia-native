import React, { useState } from 'react';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import { StyleSheet,LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import 'moment/locale/id';
import {StatusBar} from 'expo-status-bar'
import * as Permissions from 'expo-permissions'
import {
	Inter_100Thin,
	Inter_200ExtraLight,
	Inter_300Light,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	Inter_800ExtraBold,
	Inter_900Black
} from '@expo-google-fonts/inter';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './provider/AuthProvider';
import {AppearanceProvider} from 'react-native-appearance'
import RNFS from 'react-native-fs'

LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

export default function App(props) {
	const [isLoadingComplete, setLoadingComplete] = useState(false);

	if (!isLoadingComplete && !props.skipLoadingScreen) {
		return (
			<>
			<StatusBar style="light" translucent animated />
			<AppLoading
				startAsync={loadResourcesAsync}
				onError={handleLoadingError}
				onFinish={() => handleFinishLoading(setLoadingComplete)}
			/>
			</>
		);
	} else {
		return (
			<SafeAreaView style={styles.container}>
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
	const wait = await Promise.all([
		Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY),
		Asset.loadAsync([
			require('./assets/icon.png'),
			require('./assets/splash.png'),
			require('./assets/login.png'),
			require('./assets/register.png'),
			require('./assets/forget.png'),
			require('./assets/404.png'),
			require('./assets/avatar.png'),
			require('./assets/landing.png'),
			require('./assets/transparent.png'),
		]),
		Font.loadAsync({
			Inter_100Thin,
			Inter_200ExtraLight,
			Inter_300Light,
			Inter_Regular: Inter_400Regular,
			Inter_Medium:Inter_500Medium,
			Inter_SemiBold: Inter_600SemiBold,
			Inter_Bold: Inter_700Bold,
			Inter_ExtraBold: Inter_800ExtraBold,
			Inter_900Black,
		})
	]);

	if(wait[0]?.status === 'granted') {
		const ada = await RNFS.exists(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia`);
		if(!ada) {
			await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia`)
		}
	}
}

function handleLoadingError(error) {
	// In this case, you might want to report the error to your error reporting
	// service, for example Sentry
	console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
	setLoadingComplete(true);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
