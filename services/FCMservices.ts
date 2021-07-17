import SyncModule from '@pn/module/SyncModule';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging'

export default async function handleFCMData(remote: FirebaseMessagingTypes.RemoteMessage){
    console.log("BACKGROUND_MESSAGES",remote);
    if(remote?.data?.type == 'sync') {
        await SyncModule.sync();
    }
    return Promise.resolve();
}