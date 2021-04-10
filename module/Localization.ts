import Portalnesia from './Portalnesia'
import {DeviceEventEmitter} from 'react-native'
import {LocalizationConstants,Locale} from './types'

let constants: LocalizationConstants = Portalnesia.initialLocalization
const handlers: Set<Function> = new Set();
DeviceEventEmitter.addListener("localizationChange",(next: LocalizationConstants)=>{
    if(JSON.stringify(next) !== JSON.stringify(constants)) {
        constants = next;
        handlers.forEach(handler=>handler());
    }
})

namespace PNLocalization {
    /**
     * Get current country ("US","ID",...)
     * @returns string
     */
    export function getCountry(): string {
        return constants.country;
    }

    /**
     * Get list of locales in devices
    */
    export function getLocales(): Locale[] {
        return constants.locales
    }

    export function addEventListener(type: 'localizationChange', handler: Function): void {
        if(type === 'localizationChange') {
            handlers.add(handler);
        }
    }
    
    export function removeEventListener(type:'localizationChange',handler: Function): void {
        if(type === 'localizationChange') {
            handlers.delete(handler)
        }
    }
    
    export function getLanguage<T extends string>(languageTags: ReadonlyArray<T>): {languageTag: T} | undefined {
        const locales = getLocales();
        for (let i=0;i<locales.length;i++) {
            const current = locales[i];
            const {languageTag,languageCode} = current;
    
            if(languageTags.includes(languageTag as T)) {
                return {languageTag: languageTag as T}
            }
    
            const partial = current.languageCode;
            const next = locales[i+1];
    
            if((!next || partial !== next.countryCode) && languageTags.includes(partial as T)) {
                return {languageTag: partial as T}
            }
    
            if((!next || languageCode !== next.languageCode) && languageTags.includes(languageCode as T)) {
                return {languageTag: languageCode as T}
            }
        }
    }
}

export default PNLocalization;