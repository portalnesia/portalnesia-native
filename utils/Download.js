import React from 'react';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'
import { AuthContext } from '@pn/provider/AuthProvider';
import RNDownloader from 'react-native-background-downloader'
import BackgroundService from 'react-native-background-actions'
import RNFS from 'react-native-fs'
import * as MediaLibrary from 'expo-media-library'
import i18n from 'i18n-js'

const baseNotificationRequestInput = {
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
function initBaseNotificationRequestInput(filename, channelId) {
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

const errorNotification = (identifier,baseNotificationRI,uri) =>({
    ...baseNotificationRI,
    identifier:`err${baseNotificationRI.content.title}_${identifier}`,
    content: {
        ...baseNotificationRI.content,
        body:i18n.t('download_failed'),
        sticky:false,
        data:{
            url:uri
        }
    }
});
const finnishNotification = (identifier,baseNotificationRI,uri) =>({
    ...baseNotificationRI,
    identifier:`fin${baseNotificationRI.content.title}_${identifier}`,
    content: {
        ...baseNotificationRI.content,
        body:i18n.t('download_complete'),
        sticky:false,
        data:{
            url:uri
        }
    }
});

export const checkAndCreateAlbum=async(argument)=>{
    if(argument?.saveToAsset) {
        const asset = await MediaLibrary.createAssetAsync(`file://${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${argument?.filename}`)
        const album = await MediaLibrary.getAlbumAsync("Portalnesia")
        if(album == null) {
            await MediaLibrary.createAlbumAsync("Portalnesia",asset,false)
        } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset],album,false)
        }
        return;
    } else {
        return;
    }
}

const downloadTask = async(argument) =>{
    const identifier = new Date().getTime();
    const baseNotificationRI = initBaseNotificationRequestInput(argument.filename, "Download");
    const errorNot = errorNotification(identifier,baseNotificationRI,argument.uri)
    const finnishNot = finnishNotification(identifier,baseNotificationRI,argument.uri)

    await new Promise((resolve,reject)=>{
        RNDownloader.download({
            id:`download_${argument?.filename}`,
            url:argument.url,
            destination:`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${argument?.filename}`
        }).begin(async(expectedBytes)=>{
            await BackgroundService.updateNotification({progressBar:{max:expectedBytes,value:0,indeterminate:false}})
        }).progress(async(_,value,total)=>{
            await BackgroundService.updateNotification({progressBar:{max:total,value:value,indeterminate:false}})
        }).done(async()=>{
            await checkAndCreateAlbum();
            await Notifications.scheduleNotificationAsync(finnishNot);
            resolve()
        }).error(async()=>{
            await Notifications.scheduleNotificationAsync(errorNot);
            reject()
        })
    })
    
}

class PNDownload{
    constructor(task,option) {
        this.task = task;
        this.option = option
    }
    start(){
        return BackgroundService.start(this.task,this.option)
    }
}

export default function downloadFile(url,filename,uri="pn://url",saveToAsset=false){
    return new Promise((resolve,reject)=>{
        const options = {
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
                saveToAsset,
                uri
            },
            linkingURI:uri,
            progressBar:{
                max:100,
                value:0,
                indeterminate:true
            }
        }
        
        Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY)
        .then(({status})=>{
            return new Promise((res,rej)=>{
                if(status!=='granted') return rej({message:i18n.t('permission_storage')})
                return res();
            })
        }).then(()=>{
            const a = new PNDownload(downloadTask,options)
            resolve(a)
        })
        .catch(()=>reject)
    })
}

export const saveBase64=async (data,filename)=>{
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY);
    await new Promise((res, rej) => {
        if (status !== 'granted')
            return rej({ message: i18n.t('permission_storage') });
        return res();
    });
    await RNFS.writeFile(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`, data, 'base64');
    //await checkAndCreateAlbum({saveToAsset:true,filename})
}