import SyncModule from '@pn/module/SyncModule';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging'
import Portalnesia,{NotificationOptions,NotificationMessageObject, NotificationActionType,NotificationMessages} from '@portalnesia/react-native-core'

export default async function handleFCMData(remote: FirebaseMessagingTypes.RemoteMessage){
    //console.log("BACKGROUND_MESSAGES",remote);
    if(remote?.data?.type == 'sync') {
        await SyncModule.sync();
    } else {
        try {
            const {channel_id,link,icon,sound,type,id,messages,action,...other} = remote?.data
            const options: NotificationOptions = ((other as any) as NotificationOptions);
            options.uri = link;
            let isActive: NotificationMessages|null=null;
            if(typeof action !== 'undefined') {
                const act = JSON.parse(action) as NotificationActionType[];
                options.action = act;
            }
            if(typeof messages !== 'undefined') {
                const msg = JSON.parse(messages) as NotificationMessageObject;
                options.messages = msg;
                const isActiveNotification = await Portalnesia.Notification.isNotificationActive(Number(id));
                if(isActiveNotification) {
                    isActive = msg?.message[0];
                }
            }
            if(isActive !== null) {
                Portalnesia.Notification.addReplyNotification(Number(id),isActive);
            } else {
                Portalnesia.Notification.notify(Number(id),channel_id,options);
            }
        } catch(e) {
            console.log(e);
        }
    }
}