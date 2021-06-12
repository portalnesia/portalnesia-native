import 'react-native-gesture-handler'
import 'expo-asset'
import {AppRegistry} from 'react-native'
import {enableScreens} from 'react-native-screens'
import App from './App';
import Auth from './activity/auth/AuthActivity'
import SyncAdapter from './services/SyncService'
import handleFCM from './services/FCMservices'
import messaging from '@react-native-firebase/messaging';
//~0.63.4
enableScreens(true);

messaging().setBackgroundMessageHandler(handleFCM);

AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('auth', () => Auth);
AppRegistry.registerHeadlessTask("PN_SYNC_TASK",()=>SyncAdapter);
//registerRootComponent(App);
