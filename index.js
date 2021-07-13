import 'react-native-gesture-handler'
import 'expo-asset'
import {AppRegistry} from 'react-native'
import App from './App';
import Auth from './activity/auth/AuthActivity'
import Share from './activity/share/ShareActivity'
import SyncAdapter from './services/SyncService'
import handleFCM from './services/FCMservices'
import messaging from '@react-native-firebase/messaging';

AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('auth', () => Auth);
AppRegistry.registerComponent('share', () => Share);
messaging().setBackgroundMessageHandler(handleFCM);
AppRegistry.registerHeadlessTask("PN_SYNC_TASK",()=>SyncAdapter);