import React from 'react';
import {PermissionsAndroid} from 'react-native'
import * as Notifications from 'expo-notifications'
import BackgroundService,{BackgroundTaskOptions} from 'react-native-background-actions'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:true,
        shouldSetBadge:true
    })
})

const baseNotificationRequestInput: Notifications.NotificationRequestInput = {
    identifier: '',
    content: {
        title: '',
        body: '',
        vibrate: [250],
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: false,
    },
    trigger: {
        channelId: ''
    }
};

function initBaseNotificationRequestInput(filename: string, channelId: string) {
    let baseNotificationRI = {
        ...baseNotificationRequestInput,
        content: {
            ...baseNotificationRequestInput.content,
            title: filename
        },
        trigger: {
            channelId,
            seconds: 1,
            repeats: false
        }
    };
    return baseNotificationRI;
}

const errorNotification = (identifier: string,baseNotificationRI: Notifications.NotificationRequestInput,uri: string): Notifications.NotificationRequestInput =>({
    ...baseNotificationRI,
    identifier:`err${baseNotificationRI.content.title}_${identifier}`,
    content: {
        ...baseNotificationRI.content,
        body:"Download failed",
        sticky:false,
        data:{
            url:uri
        }
    }
});

const finnishNotification = (identifier: string,baseNotificationRI: Notifications.NotificationRequestInput,uri: string): Notifications.NotificationRequestInput =>({
    ...baseNotificationRI,
    identifier:`fin${baseNotificationRI.content.title}_${identifier}`,
    content: {
        ...baseNotificationRI.content,
        body:"Download completed",
        sticky:false,
        data:{
            url:uri
        }
    }
});

export type ArgumentType = {
    url: string,
    filename: string,
    uri: string,
    completeUri: string 
}

export interface TaskOptions extends BackgroundTaskOptions {
    parameters: ArgumentType
}

const downloadTask = (argument?: ArgumentType) =>{
    return new Promise<void>((resolve)=>{
        if(typeof argument !== 'undefined') {
            const identifier = new Date().getTime().toString();
            const baseNotificationRI = initBaseNotificationRequestInput(argument.filename, "Download");
            const errorNot = errorNotification(identifier,baseNotificationRI,argument.uri)
            const finnishNot = finnishNotification(identifier,baseNotificationRI,argument.completeUri);
    
            RNFS.downloadFile({
                fromUrl:argument.url,
                toFile: `${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${argument?.filename}`,
                begin:async(res: RNFS.DownloadBeginCallbackResult)=>{
                    await BackgroundService.updateNotification({progressBar:{max:res.contentLength,value:0,indeterminate:false},taskDesc:"Prepare download...",taskTitle:argument?.filename})
                },
                progress:async(res:RNFS.DownloadProgressCallbackResult)=>{
                    await BackgroundService.updateNotification({progressBar:{max:res.contentLength,value:res.bytesWritten,indeterminate:false},taskDesc:"Downloading...",taskTitle:argument?.filename})
                }
            }).promise
            .then((res)=>{
                return new Promise(resolve=>{
                    if(res.statusCode == 200) {
                        Notifications.scheduleNotificationAsync(finnishNot).then(resolve)
                    } else {
                        Notifications.scheduleNotificationAsync(errorNot).then(resolve)
                    }
                })
            })
            .then(()=>{
              resolve();  
            })
            .catch(()=>resolve());
        } else {
            resolve();
        }
    })
}

class PNDownload{
    task: (taskData?: ArgumentType) => Promise<void>
    option: TaskOptions

    constructor(task: (taskData?: ArgumentType)=>Promise<void>,option: TaskOptions) {
        this.task = task;
        this.option = option
    }

    start(){
        return BackgroundService.start<ArgumentType>(this.task,this.option)
    }
    stop(){
        return BackgroundService.stop();
    }
}

export default async function downloadFile(url: string,filename: string,uri: string="pn://news",completeUri: string|null=null){
    const identifier = new Date().getTime().toString();    
    const options: TaskOptions = {
        taskName:`download_${filename}_${identifier}`,
        taskTitle:`Task`,
        taskDesc:`Background Task`,
        taskIcon:{
            name:'ic_launcher',
            type:'mipmap'
        },
        parameters:{
            url,
            filename,
            uri,
            completeUri: (completeUri !== null ? completeUri : uri)
        },
        linkingURI:uri,
        progressBar:{
            max:100,
            value:0,
            indeterminate:true
        }
    }
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    
    if(granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(i18n.t('errors.permission_storage'));
    }

    const a = new PNDownload(downloadTask,options)
    return a;
}

export async function saveBase64(data: string,filename: string) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    
    if(granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(i18n.t('errors.permission_storage'));
    }

    await RNFS.writeFile(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`, data, 'base64');
}