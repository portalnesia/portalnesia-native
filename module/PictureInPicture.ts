import {NativeModules,NativeModulesStatic,DeviceEventEmitter} from 'react-native'
import {PictureInPictureInterface} from './types'

const {PNpip} = <{PNpip:PictureInPictureInterface} & NativeModulesStatic>NativeModules

const handlers: Set<Function> = new Set();

DeviceEventEmitter.addListener("onPictureInPictureModeChange",(data: {isPIP: boolean})=>{
    handlers.forEach(handler=>handler(data));
})

type PIPListener = (data:{isPIP: boolean})=>void

module PictureInPicture {
    export function isAvailable(): Promise<boolean>{
        return PNpip.isAvailable();
    };
    export function enterPictureInPicture(): Promise<void>{
        return PNpip.enterPictureInPicture();
    }
    export function addListener(listener: PIPListener){
        handlers.add(listener);
    }
    export function removeListener(listener: PIPListener){
        handlers.delete(listener);
    }
}

export default PictureInPicture
