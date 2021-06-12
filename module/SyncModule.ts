import {NativeModules,NativeModulesStatic} from 'react-native'
import {SyncModuleInterface} from './types'

const {PNSync} = <{PNSync:SyncModuleInterface} & NativeModulesStatic>NativeModules

export default PNSync;