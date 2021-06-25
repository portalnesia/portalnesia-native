import React from 'react';
import { Asset } from 'expo-asset';
import { StyleSheet,LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import 'moment/locale/id';
import {
	Inter_300Light,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import {AppearanceProvider} from 'react-native-appearance'
import remoteConfig from '@react-native-firebase/remote-config'
import BaseProvider from './BaseProvider';

LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

async function loadResourcesAsync() {
	// load all resources such as images, fonts, etc.
	await Promise.all([
		Asset.loadAsync([
			require('../assets/icon.png'),
			require('../assets/splash.png'),
			require('../assets/avatar.png'),
			require('../assets/landing.png'),
			require('../assets/transparent.png'),
			require('../assets/login.png'),
			require('../assets/forget.png'),
			require('../assets/register.png'),
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

function BaseActivity({children}: {children: React.ReactNode}) {
    React.useEffect(()=>{
        loadResourcesAsync();
    },[])

	return (
        <SafeAreaView style={[styles.container]}>
            <AppearanceProvider>
                <BaseProvider>
                    {children}
                </BaseProvider>
            </AppearanceProvider>
        </SafeAreaView>
    );
}
export default React.memo(BaseActivity)