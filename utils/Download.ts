import {PermissionsAndroid} from 'react-native'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import {getFreeDiskStorageAsync} from 'expo-file-system'
import BackgroundDownloader,{DownloadOption, DownloadTask} from 'react-native-background-downloader'
import Notification,{NotificationOptions} from '@pn/module/Notification'

export type ArgumentType = {
    url: string,
    filename: string,
    uri: string,
    completeUri: string 
}

export interface TaskOptions extends DownloadOption {
    title: string;
    notification_id:number;
    uri: string;
    completeUri: string;
}

class PNDownload{
    task: DownloadTask
    option: TaskOptions
    private notification: Pick<NotificationOptions,"title"|"uri">;

    constructor(option: TaskOptions) {
        this.option = option

        this.task = BackgroundDownloader.download({
            id: option.id,
            url:option.url,
            destination:option.destination
        })

        this.notification = {
            uri:option.uri,
            title:option.title
        }
    }

    async start(){
        const free = await getFreeDiskStorageAsync();
        this.task.begin(async(bytes)=>{
            if(free < bytes) {
                this.task.stop();
                const notification: NotificationOptions = {
                    ...this.notification,
                    body:"Disk storage full",
                    progress:{max:0,progress:0,intermediate:false},
                    autoCancel:true,
                    onGoing:false,
                    silent:false
                }
                Notification.notify(this.option.notification_id,"Download",notification);
            } else {
                const notification: NotificationOptions = {
                    ...this.notification,
                    body:"Downloading...",
                    progress:{max:100,progress:0,intermediate:true},
                    autoCancel:false,
                    onGoing:true,
                    silent:true
                }
                Notification.notify(this.option.notification_id,"Download",notification);
            }
        }).progress((percent,bytes,total)=>{
            const notification: NotificationOptions = {
                ...this.notification,
                body:`${(percent*100).toFixed(0)}% completed`,
                progress:{max:total,progress:bytes,intermediate:false},
                autoCancel:false,
                onGoing:true,
                silent:true
            };
            Notification.notify(this.option.notification_id,"Download",notification);
        }).done(()=>{
            const notification: NotificationOptions = {
                ...this.notification,
                uri:this.option.completeUri,
                body:`Download completed`,
                progress:{max:0,progress:0,intermediate:false},
                priority:Notification.PRIORITY_HIGH,
                autoCancel:true,
                onGoing:false,
                silent:false
            };
            Notification.notify(this.option.notification_id,"Download",notification);
        }).error((err)=>{
            const notification: NotificationOptions = {
                ...this.notification,
                body:`Download failed. ${String(err)}`,
                progress:{max:0,progress:0,intermediate:false},
                autoCancel:true,
                onGoing:false,
                silent:false
            }
            Notification.notify(this.option.notification_id,"Download",notification);
        })
    }
}

export default async function downloadFile(url: string,filename: string,uri: string="pn://news",completeUri: string|null=null){
    const identifier = new Date().getTime();    
    const options: TaskOptions = {
        id:`download_${filename}_${identifier.toString()}`,
        notification_id:identifier,
        url,
        destination: `${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`,
        title: filename,
        uri,
        completeUri: (completeUri !== null ? completeUri : uri)
    }
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    
    if(granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(i18n.t('errors.permission_storage'));
    }
    const a = new PNDownload(options)
    return a;
}

export async function saveBase64(data: string,filename: string) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    
    if(granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(i18n.t('errors.permission_storage'));
    }

    await RNFS.writeFile(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`, data, 'base64');
}