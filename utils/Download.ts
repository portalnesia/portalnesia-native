import {Alert} from 'react-native'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import {EncodingType, getFreeDiskStorageAsync,StorageAccessFramework,cacheDirectory,getContentUriAsync} from 'expo-file-system'
import BackgroundDownloader,{DownloadOption, DownloadTask} from 'react-native-background-downloader'
import Notification,{NotificationOptions} from '@pn/module/Notification'
import {number_size,Ktruncate} from '@pn/utils/Main'
import PNFile from '@pn/module/PNFile'

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
    mime: string;
    saf: string;
    identifier:number;
}

async function doneTask(option: TaskOptions,size?:number){
    try {
        const new_file = await StorageAccessFramework.createFileAsync(option.saf,option.title,option.mime);
        const data = await StorageAccessFramework.readAsStringAsync(`file://${option.destination}`,{encoding:EncodingType.Base64});
        await StorageAccessFramework.writeAsStringAsync(new_file,data,{encoding:EncodingType.Base64});
        await StorageAccessFramework.deleteAsync(`file://${option.destination}`,{idempotent:true});
        const path = await PNFile.getRealPathFromSaf(option.saf);
        const completeUri = `pn://second-screen?type=open_file&file=${encodeURIComponent(path)}`;
        const notification: NotificationOptions = {
            title:option.title,
            uri:completeUri,
            body:`Download completed`,
            progress:{max:0,progress:0,intermediate:false},
            priority:Notification.PRIORITY_HIGH,
            autoCancel:true,
            onGoing:false,
            silent:false
        };
        Notification.notify(option.notification_id,"Download",notification);
    } catch(err) {
        const notification: NotificationOptions = {
            title:option.title,
            uri:option.uri,
            body:`Download failed. ${String(err)}`,
            progress:{max:0,progress:0,intermediate:false},
            autoCancel:true,
            onGoing:false,
            silent:false
        }
        Notification.notify(option.notification_id,"Download",notification);
    }
    return Promise.resolve();
}

class PNDownload{
    task: DownloadTask
    option: TaskOptions
    size: number;
    private notification: Pick<NotificationOptions,"title"|"uri">;

    constructor(option: TaskOptions) {
        this.option = option

        this.task = BackgroundDownloader.download({
            id: option.id,
            url:option.url,
            destination:`file://${option.destination}`
        })

        this.notification = {
            uri:option.uri,
            title:option.title
        }
        this.size=0;
    }

    async start(){
        const free = await getFreeDiskStorageAsync();
        this.task.begin(async(bytes)=>{
            this.size=bytes;
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
            const split = this.option.title.split(".");
            const length = split.length;
            const ext = split[length-1];
            split.splice(length-1,1);
            const filename = split.join(".");
            const notification: NotificationOptions = {
                ...this.notification,
                title: `${Ktruncate(filename,25)}...${ext}`,
                body:`${number_size(bytes,1)}/${number_size(total,1)}`,
                progress:{max:total,progress:bytes,intermediate:false},
                autoCancel:false,
                onGoing:true,
                silent:true
            };
            Notification.notify(this.option.notification_id,"Download",notification);
        }).done(()=>{
            doneTask(this.option,this.size);
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

export default async function downloadFile(url: string,filename: string,uri: string="pn://news",mime: string){
    const identifier = new Date().getTime();
    const saf = await getSaf();  
    const options: TaskOptions = {
        id:`download_${filename}_${identifier.toString()}`,
        notification_id:identifier,
        url,
        destination: `${RNFS.CachesDirectoryPath}/${identifier}_${filename}`,
        title: filename,
        uri,
        saf,
        mime,
        identifier
    }
    const a = new PNDownload(options)
    return a;
}

export async function saveBase64(data: string,filename: string,mime="image/png") {
    const saf = await getSaf();
    const file = await StorageAccessFramework.createFileAsync(saf,filename,mime);
    await StorageAccessFramework.writeAsStringAsync(file,data,{encoding:EncodingType.Base64});
}

export async function getSaf(force: boolean=false,nullable:boolean=false): Promise<string|null> {
    try{
        if(force) return await requestPermission();
        const safs = await PNFile.getUriPermission();
        if(safs.length > 0) {
            const saf = decodeURIComponent(safs[0]);
            return saf;
        }
        if(nullable) return null;
        return await requestPermission();
    } catch(e) {
        console.log(e);
        return await requestPermission();
    }
}

async function requestPermission() {
    await showRequestDialog();
    const saf = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if(saf.granted) {
        const save_saf = decodeURIComponent(saf.directoryUri);
        return save_saf;
    }
    throw new Error(i18n.t('errors.permission_storage'));
}

function showRequestDialog() {
    return new Promise<void>(res=>{
        Alert.alert(
            i18n.t("warning"),
            i18n.t("errors.ext_permission"),
            [{
                text:"OK",
                onPress:()=>res()
            }],
            {
                cancelable:false
            }
        )
    })
}

/**
 * 
 * @param from filepath with file://
 * @param filename name of file
 * @param mime mimetype
 */
export async function moveFile(from:string,filename:string,mime:string){
    const saf = await getSaf();
    const data = await StorageAccessFramework.readAsStringAsync(from,{encoding:EncodingType.Base64});
    const file = await StorageAccessFramework.createFileAsync(saf,filename,mime);
    await StorageAccessFramework.writeAsStringAsync(file,data,{encoding:EncodingType.Base64});
    await StorageAccessFramework.deleteAsync(from,{idempotent:true});
    return Promise.resolve();
}