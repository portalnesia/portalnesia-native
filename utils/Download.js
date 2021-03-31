import React from 'react';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'
import { AuthContext } from '@pn/provider/AuthProvider';
import RNDownloader from 'react-native-background-downloader'
import BackgroundService from 'react-native-background-actions'
import RNFS from 'react-native-fs'
import * as MediaLibrary from 'expo-media-library'

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:false,
        shouldSetBadge:false
    })
})

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

const errorNotification = (baseNotificationRI) =>({
    ...baseNotificationRI,
    identifier:`err${baseNotificationRI.content.title}`,
    content: {
        ...baseNotificationRI.content,
        body:'Failed to download',
        sticky:false
    }
});
const finnishNotification = (baseNotificationRI) =>({
    ...baseNotificationRI,
    identifier:`fin${baseNotificationRI.content.title}`,
    content: {
        ...baseNotificationRI.content,
        body:'Download completed!',
        sticky:false
    }
});

const checkAndCreateAlbum=(argument)=>{
    return new Promise(async(rere)=>{
        if(argument?.saveToAsset) {
            const asset = await MediaLibrary.createAssetAsync(`file://${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${argument?.filename}`)
            const album = await MediaLibrary.getAlbumAsync("Portalnesia")
            if(album == null) {
                MediaLibrary.createAlbumAsync("Portalnesia",asset,false).then(rere)
            } else {
                MediaLibrary.addAssetsToAlbumAsync([asset],album,false).then(rere)
            }
        } else rere();
    })
}

const downloadTask = async(argument) =>{
    const baseNotificationRI = initBaseNotificationRequestInput(argument.filename, "Download");
    const errorNot = errorNotification(baseNotificationRI)
    const finnishNot = finnishNotification(baseNotificationRI)

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
                saveToAsset
            },
            linkingURI:uri,
            progressBar:{
                max:100,
                value:0,
                indeterminate:true
            }
        }
        const chanOption={
            name:"Download",
            importance:Notifications.AndroidImportance.HIGH,
            lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC,
            sound:'default',
            vibrationPattern:[250],
            enableVibrate:true
        }
        const loadingInfo = async ()=>{
            const chanel = await Notifications.getNotificationChannelAsync("Download");
            return await new Promise((res) => {
                if (chanel === null) {
                    Notifications.setNotificationChannelAsync("Download", chanOption)
                        .then(() => res);
                }
                res();
            });
        }
        
        loadingInfo()
        .then(()=>{
            return Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY)
        })
        .then(({status})=>{
            return new Promise((res,rej)=>{
                if(status!=='granted') return rej({message:"Sorry, we need camera roll permissions"})
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
            return rej({ message: "Sorry, we need camera roll permissions" });
        return res();
    });
    await RNFS.writeFile(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`, data, 'base64');
    //await checkAndCreateAlbum({saveToAsset:true,filename})
}