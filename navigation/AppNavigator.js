import React, { useContext } from 'react';
import {useWindowDimensions} from 'react-native'
//import * as firebase from 'firebase';
import { NavigationContainer,DefaultTheme } from '@react-navigation/native';
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';
//import {createNativeStackNavigator} from 'react-native-screens/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import {StatusBar} from 'expo-status-bar'
import {BottomNavigation,BottomNavigationTab,Icon,useTheme} from '@ui-kitten/components'
import analytics from '@react-native-firebase/analytics'
import useRootNavigation from '../navigation/useRootNavigation'
import {showInterstisial} from '../components/global/Ads'

import {linking} from './Linking'
import NotFound from '../screens/NotFound'
import Home from '../screens/Home/Home';
import Blog from '../screens/Blog/Blog';
import News from '../screens/News/News';
import Chord from '../screens/Chord/Chord';
import Menu from '../screens/Menu';
import Loading from '../screens/utils/Loading';
import BlogDetail from '../screens/Blog/BlogDetail';
import BlogList from '../screens/Blog/BlogList';
import NewsDetail from '../screens/News/NewsDetail';
import Pages from '../screens/Pages';
import ChordDetail from '../screens/Chord/ChordDetail';
import ChordList from '../screens/Chord/ChordList';
import Twitter from '../screens/Twitter/Twitter';
import TwitterThread from '../screens/Twitter/TwitterThread';
import GeodataTransform from '../screens/Geodata/Transform';
import ImageModal from '../screens/Modal/Image'
import NumberGenerator from '../screens/Tools/NumberGenerator'
import QrGenerator from '../screens/Tools/QrGenerator'
import ParseHtml from '../screens/Tools/ParseHtml'
import ImagesChecker from '../screens/Tools/ImagesChecker'
import UrlShortener from '../screens/UrlShortener'
import Contact from '../screens/Contact'
import User from '../screens/User/User'
import Setting from '../screens/Setting/Setting'
import Search from '../screens/SearchLike/Search'
import SearchFilter from '../screens/SearchLike/SearchFilter'
import Twibbon from '../screens/Twibbon/Twibbon'
import TwibbonDetail from '../screens/Twibbon/TwibbonDetail'

import { AuthContext } from '../provider/AuthProvider';

/*let SlideFromRight = (index, position, width) => {
	const inputRange = [index - 1, index, index + 1];
	const translateX = position.interpolate({
	  inputRange,
	  outputRange: [width, 0, 0]
	})
	const slideFromRight = { transform: [{ translateX }] }
	return slideFromRight
};

const TransitionConfiguration = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: (sceneProps) => {
      const { layout, position, scene } = sceneProps;
      const width = layout.initWidth;
      const { index, route } = scene
      const params = route.params || {}; // <- That's new
      const transition = params.transition || 'default'; // <- That's new
      return {
        default: SlideFromRight(index, position, width),
      }[transition];
    },
  }
}*/

/*const firebaseConfig = {
	apiKey: '',
	authDomain: '',
	databaseURL: '',
	projectId: '',
	storageBucket: '',
	messagingSenderId: '',
	appId: '',
};
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}
*/


/* CREATE BOTTOM NAVIGATOR */
const Tabs = createBottomTabNavigator();
const HomeIcon=(props)=>{
	const {selected,...other}=props
	if(selected) return <Icon {...other} name="home" />
	else return <Icon {...other} name="home-outline" />
}
const NewsIcon=(props)=>{
	const {selected,...other}=props
	if(selected) return <Icon {...other} name="file-text" />
	else return <Icon {...other} name="file-text-outline" />
}
const MusicIcon=(props)=>{
	const {selected,...other}=props
	if(selected) return <Icon {...other} name="music" />
	else return <Icon {...other} name="music-outline" />
}
const MenuIcon=(props)=>{
	const {selected,...other}=props
	return <Icon {...other} name="menu" />
}
const SearchIcon=(props)=>{
	const {selected,...other}=props
	return <Icon {...other} name="search" />
}

const BottomTabBar = ({navigation,state})=>{
	const onPress=(index)=>{
		const route = state.routes[index];
		const isFocus = state.index === index;
		const event = navigation.emit({
			type:"tabPress",
			target:route.key,
			canPreventDefault:true
		})
		if(!isFocus && !event.defaultPrevented) {
			navigation.navigate(route.name)
		}
	}
	return (
		<BottomNavigation selectedIndex={state.index} onSelect={index=>onPress(index)}>
			<BottomNavigationTab title="HOME" icon={(props)=><HomeIcon {...props} selected={state.index===0} />} />
			<BottomNavigationTab title="NEWS" icon={(props)=><NewsIcon {...props} selected={state.index===1} />} />
			<BottomNavigationTab title="SEARCH" icon={(props)=><SearchIcon {...props} selected={state.index===2} />} />
			<BottomNavigationTab title="CHORD" icon={(props)=><MusicIcon {...props} selected={state.index===3} />} />
			<BottomNavigationTab title="MENU" icon={(props)=><MenuIcon {...props} />} />
		</BottomNavigation>
	)
}

const MainTabs=()=>(
	<Tabs.Navigator initialRouteName="Home" tabBar={props=><BottomTabBar {...props} />}>
		<Tabs.Screen name="Home" component={Home} />
		<Tabs.Screen name="News" component={News} />
		<Tabs.Screen name="Search" component={Search} />
		<Tabs.Screen name="Chord" component={Chord} />
		<Tabs.Screen name="Menu" component={Menu} />
	</Tabs.Navigator>
)
/* CREATE BOTTOM NAVIGATOR */


const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const MainStackScreen=()=>(
	<MainStack.Navigator
		screenOptions={{
			headerShown: false,
			gestureEnabled:true,
			gestureDirection:'horizontal',
			cardStyle:{backgroundColor:'transparent'},
			...TransitionPresets.SlideFromRightIOS
		}}
		initialRouteName="MainTabs"
		
	>
		<MainStack.Screen name="NotFound" component={NotFound} />
		<MainStack.Screen name="MainTabs" component={MainTabs} />
		<MainStack.Screen name="NewsDetail" component={NewsDetail} />
		<MainStack.Screen name="ChordDetail" component={ChordDetail} />
		<MainStack.Screen name="ChordList" component={ChordList} />
		<MainStack.Screen name="Pages" component={Pages} />
		<MainStack.Screen name="Blog" component={Blog} />
		<MainStack.Screen name="BlogDetail" component={BlogDetail} />
		<MainStack.Screen name="Twitter" component={Twitter} />
		<MainStack.Screen name="TwitterThread" component={TwitterThread} />
		<MainStack.Screen name="GeodataTransform" component={GeodataTransform} />
		<MainStack.Screen name="NumberGenerator" component={NumberGenerator} />
		<MainStack.Screen name="ParseHtml" component={ParseHtml} />
		<MainStack.Screen name="ImagesChecker" component={ImagesChecker} />
		<MainStack.Screen name="QrGenerator" component={QrGenerator} />
		<MainStack.Screen name="UrlShortener" component={UrlShortener} />
		<MainStack.Screen name="Contact" component={Contact} />
		<MainStack.Screen name="Setting" component={Setting} />
		<MainStack.Screen name="BlogList" component={BlogList} />
		<MainStack.Screen name="User" component={User} />
		<MainStack.Screen name="SearchFilter" component={SearchFilter} />
		<MainStack.Screen name="Twibbon" component={Twibbon} />
		<MainStack.Screen name="TwibbonDetail" component={TwibbonDetail} />

	</MainStack.Navigator>
)

let screenChange=0;
const disableAdsArr = ["Setting","Contact","Pages",'NotFound','ImageModal'];
export default () => {
	const {navigationRef} = useRootNavigation();
	const routeNameRef = React.useRef(null)
	const auth = useContext(AuthContext);
	const {state,theme:selectedTheme} = auth;
	const {user,session} = state
	const theme=useTheme()
	
	return (
		<>
			<StatusBar style={user === null || session == null ? 'light' : (selectedTheme==='light' ? "dark" : "light")} translucent animated backgroundColor={user === null || session == null ? theme['color-primary-500'] : theme['background-basic-color-1']} />
			{user == null || session == null ? <Loading /> : (
				<NavigationContainer
					ref={navigationRef}
					onReady={()=>{
						routeNameRef.current = navigationRef.current.getCurrentRoute().name
					}}
					onStateChange={async()=>{
						const prevRouteName = routeNameRef.current;
						const currentRouteName = navigationRef.current.getCurrentRoute().name
						if(prevRouteName !== currentRouteName) {
							await analytics().logScreenView({
								screen_class: currentRouteName,
								screen_name: currentRouteName
							})
						}
						if(screenChange === 4) {
							const random = Math.floor(Math.random() * 3);
							screenChange = 0;
							if(random === 0 && disableAdsArr.indexOf(currentRouteName) === -1) await showInterstisial();
						} else {
							screenChange += 1;
						}
					}}
					linking={linking}
				>
					{user == null && <Loading />}
					<RootStack.Navigator mode="modal" initialRouteName="Main" screenOptions={{headerShown:false}}>
						<RootStack.Screen name="Main" component={MainStackScreen} />
						<RootStack.Screen name="ImageModal" component={ImageModal} options={{
							headerShown: false,
							gestureEnabled:true,
							gestureDirection:'vertical',
							//...TransitionPresets.ModalPresentationIOS,
							...TransitionPresets.ModalSlideFromBottomIOS
						}} />
					</RootStack.Navigator>
				</NavigationContainer>
			)}
		</>
	);
};