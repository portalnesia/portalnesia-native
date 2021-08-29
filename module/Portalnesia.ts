import {NativeModules,NativeModulesStatic} from 'react-native'
import {PortalnesiaInterface} from './types'
export type {PortalnesiaInterface} from './types'
const {Portalnesia} = <{Portalnesia:PortalnesiaInterface} & NativeModulesStatic>NativeModules

export default Portalnesia;