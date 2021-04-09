import {NativeModules} from 'react-native'

export interface PortalnesiaInterface {
    /**
     * Get current languages
     * @returns string
     */
    getLanguage:()=>string;
    getCountry:()=>string;
    URL: string;
}

declare module 'react-native' {
    interface NativeModulesStatic {
        Portalnesia: PortalnesiaInterface
    }
}
const {Portalnesia} = NativeModules

export default Portalnesia;