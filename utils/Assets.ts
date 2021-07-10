import { Asset } from 'expo-asset';
import {
	Inter_300Light,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as Font from 'expo-font';
import remoteConfig from '@react-native-firebase/remote-config'

export default async function loadResourcesAsync() {
    async function remoteConfigInit() {
        await remoteConfig().setDefaults({tuner_enabled:false});
        await remoteConfig().fetchAndActivate();
        return Promise.resolve();
    }

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
        remoteConfigInit
    ])
}