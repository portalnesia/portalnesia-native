import SyncModule from '@pn/module/SyncModule';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:true,
        shouldSetBadge:true
    })
})

function NotificationRequestInput(identifier: string,title: string,body: string, channelId: string,data?:Record<string,string>): Notifications.NotificationRequestInput {
    let baseNotificationRI: Notifications.NotificationRequestInput = {
        identifier,
        content: {
            vibrate: [250],
            priority: Notifications.AndroidNotificationPriority.HIGH,
            sticky: false,
            title,
            body,
            data,
            categoryIdentifier:"message_category"
        },
        trigger: {
            channelId,
            seconds: 5,
            repeats: false
        }
    };
    return baseNotificationRI;
}

export default async function handleFCMData(remote: FirebaseMessagingTypes.RemoteMessage){
    console.log("BACKGROUND_MESSAGES",remote);
    if(remote?.data?.type == 'sync') {
        await SyncModule.sync();
    }
    if(remote?.data?.type == "data_notification") {
        const {identifier,title,body,channel_id,type,action,...other} = remote?.data
        const notif = NotificationRequestInput(identifier||"general",title||"Notification Title",body||"Notification Body",channel_id||"General",{...other})
        await Notifications.scheduleNotificationAsync(notif);
        /*if(action) {
            const json_action = (JSON.parse(action) as Notifications.NotificationAction[]);
            console.log("Notification Action",json_action);
            await Notifications.setNotificationCategoryAsync(identifier||"general",json_action);
        }*/
    }
    return Promise.resolve();
}