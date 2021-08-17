import {NativeModules,NativeModulesStatic} from 'react-native'
import {NotificationInterface} from './types'

export type {NotificationInterface,NotificationOptions} from './types'

const {PNNotification} = <{PNNotification:NotificationInterface} & NativeModulesStatic>NativeModules

export default PNNotification;