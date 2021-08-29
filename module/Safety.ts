import {NativeModules,NativeModulesStatic} from 'react-native'
import {SafetyInterface} from './types'
export type {SafetyInterface} from './types'
const {PNSafety} = <{PNSafety:SafetyInterface} & NativeModulesStatic>NativeModules
export default PNSafety;