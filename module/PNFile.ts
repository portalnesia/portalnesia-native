import {NativeModules,NativeModulesStatic} from 'react-native'
import {FileInterface} from './types'
export type {FileInterface} from './types'
const {PNFile} = <{PNFile:FileInterface} & NativeModulesStatic>NativeModules
export default PNFile;