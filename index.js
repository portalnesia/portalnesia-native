import 'react-native-gesture-handler'
import 'expo-asset'
import { registerRootComponent } from 'expo';
import {enableScreens} from 'react-native-screens'
import App from './App';
//~0.63.4
enableScreens(true);
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
