import 'react-native-gesture-handler'
import 'expo-asset'
import {AppRegistry} from 'react-native'
import {enableScreens} from 'react-native-screens'
import App from './App';
import Auth from './activity/auth/AuthActivity'
//~0.63.4
enableScreens(true);
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('auth', () => Auth);
//registerRootComponent(App);
