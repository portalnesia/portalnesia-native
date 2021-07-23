import {NativeModules,NativeModulesStatic} from 'react-native'
import {SafetyInterface} from './types'

const {PNSafety} = <{PNSafety:SafetyInterface} & NativeModulesStatic>NativeModules
export default PNSafety;