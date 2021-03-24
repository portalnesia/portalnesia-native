import React from 'react';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'
import {downloadToFolder} from 'expo-file-dl'
import { AuthContext } from '@pn/provider/AuthProvider';

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:false,
        shouldSetBadge:false
    })
})

export default function downloadFile(url,filaname,folder="Portalnesia"){
    return new Promise((response,reject)=>{
        const chanOption={
            name:"DownloadInfo",
            importance:Notifications.AndroidImportance.HIGH,
            lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC,
            sound:'default',
            vibrationPattern:[250],
            enableVibrate:true
        }
        const loadingInfo = Notifications.getNotificationChannelAsync("DownloadInfo") !==null ? Notifications.getNotificationChannelAsync("DownloadInfo") : Notifications.setNotificationChannelAsync("DownloadInfo",chanOption)
        
        loadingInfo
        .then(()=>{
            return Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY)
        })
        .then(({status})=>{
            return new Promise((res,rej)=>{
                if(status!=='granted') return rej({message:"Sorry, we need camera roll permissions"})
                return res();
            })
        })
        .then(()=>{
            return downloadToFolder(url,filaname,folder,"DownloadInfo");
        })
        .then(()=>response)
        .catch((err)=>reject(err));
    })
}