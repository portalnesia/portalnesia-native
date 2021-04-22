import React from 'react';
import {PermissionsAndroid} from 'react-native'
import * as Notifications from 'expo-notifications'
import RNDownloader from 'react-native-background-downloader'
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
            seconds: 5,
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

const downloadTask = async(argument?: ArgumentType) =>{
    if(typeof argument !== 'undefined') {
        const identifier = new Date().getTime().toString();
        const baseNotificationRI = initBaseNotificationRequestInput(argument.filename, "Download");
        const errorNot = errorNotification(identifier,baseNotificationRI,argument.uri)
        const finnishNot = finnishNotification(identifier,baseNotificationRI,argument.completeUri);

        await new Promise<void>((resolve,reject)=>{
            RNDownloader.download({
                id:`download_${argument?.filename}`,
                url:argument.url,
                destination:`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${argument?.filename}`
            }).begin(async(expectedBytes)=>{
                await BackgroundService.updateNotification({progressBar:{max:expectedBytes,value:0,indeterminate:false},taskDesc:"Prepare download..."})
            }).progress(async(_,value,total)=>{
                await BackgroundService.updateNotification({progressBar:{max:total,value:value,indeterminate:false},taskDesc:"Downloading..."})
            }).done(async()=>{
                await Promise.all([
                    Notifications.scheduleNotificationAsync(finnishNot),
                    //BackgroundService.stop()
                ])
                resolve()
            }).error(async()=>{
                await Promise.all([
                    Notifications.scheduleNotificationAsync(errorNot),
                    //BackgroundService.stop()
                ])
                reject()
            })
        })
        return;
    } else {
        //await BackgroundService.stop()
        return;
    }
}

class PNDownload{
    task: (taskData?: ArgumentType) => Promise<void>
    option: TaskOptions

    constructor(task: (taskData?: ArgumentType)=>Promise<void>,option: TaskOptions) {
        this.task = task;
        this.option = option
    }

    async start(){
        return await BackgroundService.start<ArgumentType>(this.task,this.option)
    }
}

export default async function downloadFile(url: string,filename: string,uri: string="pn://news",completeUri: string|null=null){
    const options: TaskOptions = {
        taskName:`download_${filename}`,
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