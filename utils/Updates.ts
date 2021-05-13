import {Alert} from 'react-native'
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

/*async function restartApplication() {
    try {
        await Updates.reloadAsync();
    } catch(e){

    }
}*/

export async function checkAndUpdateOTA(){
    try {
        const update = await Updates.checkForUpdateAsync();
        const getUpdates = await isGetUpdate(update);
        if(getUpdates) {
            const newUpdate = await Updates.fetchUpdateAsync();
            if(newUpdate.isNew && newUpdate?.manifest) {
                Alert.alert(
					"New Bundle Version Updates",
					`A new bundle version has been downloaded.\nRestart the application to apply changes!\nv${newUpdate.manifest?.version}`,
					[{
						text:"OK",
						onPress:()=>{}
					}]
				)
            }
        }
    } catch(e){}
}

