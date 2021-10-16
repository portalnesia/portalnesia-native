import Biometrics from 'react-native-biometrics'
import {promptAuthentication,biometricsExist} from './Biometrics'
import {alertWarning} from './VerifyApps'
import * as Secure from 'expo-secure-store'

export async function isLockedActive() {
    const {biometryType,available} = await Biometrics.isSensorAvailable();
    if(available && biometryType === Biometrics.Biometrics) {
        const exist = await biometricsExist();
        if(exist) {
            const setting = await Secure.getItemAsync("lock_fingerprint");
            if(setting!==null) {
                return true;
            }
        }
    }
    return false;
}

export default async function initializeLock() {
    const isActive = await isLockedActive();
    if(isActive) {
        try {
            await promptAuthentication();
        } catch(e: any) {
            await alertWarning(e?.message)
        }
    }
    return Promise.resolve();
}