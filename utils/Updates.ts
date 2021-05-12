import * as Updates from 'expo-updates'
import {Constants} from 'react-native-unimodules'
import compareVersion from 'compare-versions'

async function isGetUpdate(update: Updates.UpdateCheckResult){
    if(update.isAvailable && update?.manifest) {
        if(typeof update?.manifest?.extra?.minimumVersion === 'string' && typeof Constants.manifest.version === 'string') {
            const isUpdated = compareVersion.compare(Constants.manifest.version,update?.manifest?.extra?.minimumVersion,">=");
            if(isUpdated) return true;
            else return false;
        } else return true;
    } else return false;
}

export async function checkAndUpdateOTA(){
    try {
        const update = await Updates.checkForUpdateAsync();
        const getUpdates = await isGetUpdate(update);
        if(getUpdates) {
            await Updates.fetchUpdateAsync();
        }
    } catch(e){}
}

