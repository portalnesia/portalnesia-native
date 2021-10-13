import Portalnesia,{NotificationHandler} from '@portalnesia/react-native-core'
import * as Secure from 'expo-secure-store'
import {UserType} from '@pn/types/UserTypes'

async function notificationService(notif: NotificationHandler) {
    //console.log("Notification Services",notif);
    try {
        if(notif?.key === Portalnesia.Notification.REPLY_KEY && typeof notif?.messages === 'string') {
            const user_string = await Secure.getItemAsync('user');
            const user = JSON.parse(user_string) as UserType;
            if(user && user?.username) {
               Portalnesia.Notification.addReplyNotification(notif?.notification_id,{sender:user?.username,image: user?.picture,text:notif?.messages});
               return Promise.resolve();
            }
        } else {
            setTimeout(()=>{
                Portalnesia.Notification.cancel(notif?.notification_id)
            },1000);
            return Promise.resolve();
        }
    } catch(e) {
        if(notif?.key === Portalnesia.Notification.REPLY_KEY) Portalnesia.Notification.errorReplyNotification(notif?.notification_id);
        console.log(e);
        return Promise.resolve();
    }
    
}

export default notificationService;