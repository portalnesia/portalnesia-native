import {Alert} from 'react-native'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import {EncodingType, getFreeDiskStorageAsync,StorageAccessFramework,cacheDirectory,getContentUriAsync} from 'expo-file-system'
import BackgroundDownloader,{DownloadOption, DownloadTask} from 'react-native-background-downloader'
import {number_size,truncate as Ktruncate,generateRandom} from '@portalnesia/utils'
import Portalnesia,{NotificationOptions,DownloadOptions} from '@portalnesia/react-native-core'

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

export const DIRECTORY_DOWNLOADS = Portalnesia.Files.DIRECTORY_DOWNLOADS;
export const DIRECTORY_PICTURES = Portalnesia.Files.DIRECTORY_PICTURES;
export const DIRECTORY_MOVIES = Portalnesia.Files.DIRECTORY_MOVIES;
export const DIRECTORY_MUSIC = Portalnesia.Files.DIRECTORY_MUSIC;

async function doneTask(option: TaskOptions,size?:number){
    try {
        const new_file = await StorageAccessFramework.createFileAsync(option.saf,option.title,option.mime);
        const data = await StorageAccessFramework.readAsStringAsync(`file://${option.destination}`,{encoding:EncodingType.Base64});
        await StorageAccessFramework.writeAsStringAsync(new_file,data,{encoding:EncodingType.Base64});
        await StorageAccessFramework.deleteAsync(`file://${option.destination}`,{idempotent:true});
        const path = await Portalnesia.Files.getRealPathFromSaf(option.saf);
        const completeUri = `pn://second-screen?type=open_file&file=${encodeURIComponent(path)}`;
        const notification: NotificationOptions = {
            title:option.title,
            uri:completeUri,
            body:`Download completed`,
            progress:{max:0,progress:0,intermediate:false},
            priority:Portalnesia.Notification.PRIORITY_HIGH,
            autoCancel:true,
            onGoing:false,
            silent:false
        };
        Portalnesia.Notification.notify(option.notification_id,"Download",notification);
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
        Portalnesia.Notification.notify(option.notification_id,"Download",notification);
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
                Portalnesia.Notification.notify(this.option.notification_id,"Download",notification);
            } else {
                const notification: NotificationOptions = {
                    ...this.notification,
                    body:"Downloading...",
                    progress:{max:100,progress:0,intermediate:true},
                    autoCancel:false,
                    onGoing:true,
                    silent:true
                }
                Portalnesia.Notification.notify(this.option.notification_id,"Download",notification);
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
            Portalnesia.Notification.notify(this.option.notification_id,"Download",notification);
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
            Portalnesia.Notification.notify(this.option.notification_id,"Download",notification);
        })
    }
}

export async function downloadFile(url: string,filename: string,uri: string="pn://news",mime: string){
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

class DownloadManager {
    options: DownloadOptions;

    constructor(option: DownloadOptions) {
        this.options = option;
    }

    async start() {
        return Portalnesia.Files.download(this.options);
    }
}

export default function new_download(uri: string,filename: string,mime: string,dirType: "Download" | "Movies" | "Pictures" | "Music") {
    filename = dirType === DIRECTORY_PICTURES ? `Portalnesia/${filename}` : filename;
    const options: DownloadOptions = {
        title: filename,
        uri,
        mimeType: mime,
        channel_id:"Download",
        destination:{
            type:dirType,
            path:filename
        }
    }
    const a = new DownloadManager(options);
    return a;
}

export async function saveBase64(data: string,filename: string,mime="image/png") {
    try {
        return await RNFS.writeFile(`${RNFS.ExternalStorageDirectoryPath}/Download/[portalnesia.com]_${filename}`,data,"base64");
    } catch(e) {
        console.log(e)
    }
}

export async function getSaf(force: boolean=false,nullable:boolean=false): Promise<string|null> {
    try{
        if(force) return await requestPermission();
        const safs = await Portalnesia.Files.getUriPermission();
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
    let dirType: "Download" | "Movies" | "Pictures" | "Music" = DIRECTORY_DOWNLOADS;
    if(mime?.match(/images\/+/) != null) {
        dirType = DIRECTORY_PICTURES;
    } else if(mime?.match(/audio\/+/) != null) {
        dirType = DIRECTORY_MUSIC;
    }
    return await RNFS.moveFile(from,`${RNFS.ExternalStorageDirectoryPath}/${dirType}/${filename}`);
}