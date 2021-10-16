import 'react-native-gesture-handler'
import 'expo-asset'
import {AppRegistry} from 'react-native'
import Portalnesia from '@portalnesia/react-native-core'
import App from './App';
import Auth from './activity/auth/AuthActivity'
import Share from './activity/share/ShareActivity'
import SyncAdapter from './services/SyncService'
import handleFCM from './services/FCMservices'
import notificationService from './services/NotificationService'
import TrackPlayerService from './services/MusicPlayer'
import messaging from '@react-native-firebase/messaging';
import TrackPlayer from 'react-native-track-player'

AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('auth', () => Auth);
AppRegistry.registerComponent('share', () => Share);
messaging().setBackgroundMessageHandler(handleFCM);
TrackPlayer.registerPlaybackService(()=>TrackPlayerService)
AppRegistry.registerHeadlessTask("PN_SYNC_TASK",()=>SyncAdapter);
AppRegistry.registerHeadlessTask(Portalnesia.Notification.HEADLESS_TASK,()=>notificationService);