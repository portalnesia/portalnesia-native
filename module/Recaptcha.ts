import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import Portalnesia from './Portalnesia';

export default function verifyRecaptcha(setNotif?:(type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data?: {[key: string]: any})=>void) {
    return new Promise<string>((res,rej)=>{
        const version = Constants.nativeAppVersion === null ? "1.7.0" : Constants.nativeAppVersion;
        const isUpdated = compareVersion.compare(version,"1.7.0",">=");
        if(isUpdated) {
            Portalnesia.verifyWithRecaptcha().then(res);
        } else {
            if(setNotif) setNotif(true,'Error','Please update your apps to the latest version');
            rej({message:'Please update your apps to the latest version'})
        }
    })
}