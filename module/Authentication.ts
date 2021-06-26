import {NativeModules,NativeModulesStatic} from 'react-native'
import {AuthenticationInterface} from './types'

export type {AccountManagerType} from './types'

const {PNauth} = <{PNauth:AuthenticationInterface} & NativeModulesStatic>NativeModules

export default PNauth;