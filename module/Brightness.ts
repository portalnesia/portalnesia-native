import {NativeModules,NativeModulesStatic} from 'react-native'
import {BrighnessInterface} from './types'

const {PNBrightness} = <{PNBrightness:BrighnessInterface} & NativeModulesStatic>NativeModules

module Brightness {
    export function getBrightness(): Promise<number> {
        return PNBrightness.getBrightness();
    }

    export function getSystemBrightness(): Promise<number> {
        return PNBrightness.getSystemBrightness();
    }

    export function setBrightness(value: number): Promise<void> {
        if(value < 0 || value > 1) throw Error("Brightness level must between 0 to 1");

        return PNBrightness.setBrightness(value);
    }
}
export default Brightness;