import {NativeModules,NativeModulesStatic,DeviceEventEmitter} from 'react-native'
import {ShareModuleInterfaceNative,ContinueInAppInterface,ShareData,ShareCropOptions} from './types'

export type {ShareData,ShareCropOptions,ShareCropResult} from './types'

export type ShareListenerData = (ShareData & {
    extraData?: Record<string,any>
}) | null
type ShareListenerDataString = ShareData & {
    extraData?: string
}

export type ShareListener = (data: ShareListenerData)=>void;
type ShareModuleInterface = ShareModuleInterfaceNative & ContinueInAppInterface

const {PNShare} = <{PNShare:ShareModuleInterface} & NativeModulesStatic>NativeModules
const handlers: Set<Function> = new Set();

DeviceEventEmitter.addListener("PNShare",(data: ShareListenerDataString)=>{
    if(data===null) return null;
    const {extraData,...other} = data;
    const result: ShareListenerData = other;
    //result.data = other.data.replace("raw/","");
    if(extraData && extraData!==null) {
        try {
            const jsonExtraData = JSON.parse(extraData);
            result.extraData = jsonExtraData;
        } catch(e){}
        
    }
    handlers.forEach(handler=>handler(result));
})

module ShareModule {
    export async function getSharedData(clear=true): Promise<ShareListenerData>{
        const data = await PNShare.getSharedData(clear);
        if(data===null) return null;
        const {extraData,...other} = data;
        const result: ShareListenerData = other;
        //result.data = other.data.replace("raw/","");
        if(extraData && extraData!==null) {
            const jsonExtraData = JSON.parse(extraData);
            result.extraData = jsonExtraData;
        }
        return result;
    }
    export function dismiss() {
        return PNShare.dismiss();
    }
    export function continueInApp(type: string,data: string,extraData?: Record<string,any>): Promise<void> {
        const jsonExtraData = extraData ? JSON.stringify(extraData) : undefined;
        return PNShare.continueInApp(type,data,jsonExtraData);
    }
    export function startCropActivity(type: 'png'|'jpg'|'jpeg',uri: string,options?:ShareCropOptions){
        if(options?.quality) {
            const quality = options?.quality*100;
            options.quality = quality;
        }
        return PNShare.startCropActivity(type,uri,options);
    }
    export function addListener(listener: ShareListener){
        handlers.add(listener);
    }
    export function removeListener(listener: ShareListener){
        handlers.delete(listener);
    }
}

export default ShareModule;