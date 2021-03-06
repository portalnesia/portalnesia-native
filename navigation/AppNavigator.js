import React, { useContext } from 'react';
import {AppState} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator,TransitionPresets,HeaderStyleInterpolators,TransitionSpecs,CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import {Icon,useTheme,Text} from '@ui-kitten/components'
import analytics from '@react-native-firebase/analytics'
import Modal from 'react-native-modal'
import BgTimer from 'react-native-background-timer'

import initializeLock,{isLockedActive} from '@pn/utils/Lock'
import useRootNavigation,{handleLinking,getPath} from '../navigation/useRootNavigation'
import {showInterstisial} from '../components/global/Ads'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener,getInitialURL} from 'expo-linking'
import * as Notifications from 'expo-notifications'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {checkAndUpdateOTA} from '@pn/utils/Updates'
import useSelector from '@pn/provider/actions'
import MusicPlayer from '@pn/components/musicPlayer/MusicPlayer'
import handleFCMData from '@pn/services/FCMservices';
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
import TunerScreen from '../screens/Tools/Tuner'
import UrlShortener from '../screens/UrlShortener'
import Contact from '../screens/Contact'
import User from '../screens/User/User'
import EditUserScreen from '../screens/User/Edit'
import DownloadFileScreen from '../screens/DownloadFile'
import Setting from '../screens/Setting/Setting'
import AccountSettingScreen from '../screens/Setting/Account'
import SecuritySettingScreen from '../screens/Setting/Security'
import NotificationSettingScreen from '../screens/Setting/Notification'
import Search from '../screens/SearchLike/Search'
import SearchFilter from '../screens/SearchLike/SearchFilter'
import Like from '../screens/SearchLike/Like'
import LikeFilter from '../screens/SearchLike/LikeFilter'
import Twibbon from '../screens/Twibbon/Twibbon'
import TwibbonDetail from '../screens/Twibbon/TwibbonDetail'
import OpenSource from '../screens/OpenSource/OpenSource'
import OpenSourceDetail from '../screens/OpenSource/OpenSourceDetail'
import Comments from '../screens/Modal/Comments'
import SecondScreen from '../screens/SecondScreen'
import NotificationEvent from '../screens/Notification/NotificationEvent'
import ReportScreen from '../screens/ReportScreen'
import MediaScreen from '../screens/Media'
import ReportModal from '../screens/Modal/ReportModal'
import Login from '../screens/auth/Login'
import Register from '../screens/auth/Register'
import Authentication from '../screens/auth/Authentication'
import ForgetPassword from '../screens/auth/ForgetPassword'
import ForgetPasswordForm from '../screens/auth/ForgetPasswordForm'
import { AuthContext } from '../provider/Context';
import useAPI from '@pn/utils/API';
import { logError } from '@pn/utils/log';
import ShareModule from '@pn/module/Share';
import {Portal} from '@gorhom/portal'

const urlParse = require('url-parse')

const getScreenOptions=(theme)=>({
	gestureEnabled:true,
	headerStyle:{
		backgroundColor:theme['background-basic-color-1'],
		elevation:5
	},
	headerLeftContainerStyle:{
		paddingLeft:10
	},
	headerRightContainerStyle:{
		paddingRight:10
	},
	...TransitionPresets.SlideFromRightIOS,
	cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
	transitionSpec:{
		open: TransitionSpecs.TransitionIOSSpec,
		close: TransitionSpecs.TransitionIOSSpec
	},
	headerStyleInterpolator: HeaderStyleInterpolators.forUIKit
})

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
	if(selected) return <Icon {...other} name="ios-musical-notes" pack="ionicons" />
	return <Icon {...other} name="ios-musical-notes-outline" pack="ionicons" />
}
const MenuIcon=(props)=>{
	const {selected,...other}=props
	if(selected) return <Icon {...other} name="ios-menu" pack="ionicons" />
	return <Icon {...other} name="ios-menu-outline" pack="ionicons" />
}
const SearchIcon=(props)=>{
	const {selected,...other}=props
	if(selected) return <Icon {...other} name="search" pack="font_awesome" />
	return <Icon {...other} name="search" pack="material" />
}

const tabBarIcon=(name)=>(prop)=>{
	const {focused,color,size} = prop;
	const props={
		style:{
			width:24,height:24,tintColor:color
		},
		selected:focused
	}
	if(name==='home') return <HomeIcon {...props} />
	if(name==='news') return <NewsIcon {...props} />
	if(name==='search') return <SearchIcon {...props} />
	if(name==='chord') return <MusicIcon {...props} />
	if(name==='menu') return <MenuIcon {...props} />
	return null;
}
/* CREATE BOTTOM NAVIGATOR */

let screenChange=0;
const disableAdsArr = ["Setting","Contact","Pages",'NotFound','ImageModal','Menu','AccountSettingScreen','EditUserScreen','ReportScreen','ReportModal','Comments'];

const getScreen=()=>{
	return [
		{name:"NotFound",component:NotFound,options:{headerTitle:"Not Found"}},
		{name:"NewsDetail",component:NewsDetail,options:{headerTitle:"News"}},
		{name:"ChordDetail",component:ChordDetail,options:{headerTitle:"Chord"}},
		{name:"ChordList",component:ChordList,options:{headerTitle:"Chord"}},
		{name:"Pages",component:Pages,options:{headerTitle:"Pages"}},
		{name:"Blog",component:Blog,options:{headerTitle:"Blog"}},
		{name:"BlogDetail",component:BlogDetail,options:{headerTitle:"Blog"}},
		{name:"Twitter",component:Twitter,options:{headerTitle:"Twitter Thread Reader"}},
		{name:"TwitterThread",component:TwitterThread,options:{headerTitle:"Twitter Thread Reader"}},
		{name:"GeodataTransform",component:GeodataTransform,options:{headerTitle:"Transform Coordinate"}},
		{name:"NumberGenerator",component:NumberGenerator,options:{headerTitle:"Random Number Generator"}},
		{name:"ParseHtml",component:ParseHtml,options:{headerTitle:"Parse HTML"}},
		{name:"ImagesChecker",component:ImagesChecker,options:{headerTitle:"Images Checker"}},
		{name:"Tuner",component:TunerScreen,options:{headerTitle:"Tuner"}},
		{name:"QrGenerator",component:QrGenerator,options:{headerTitle:"QR Generator"}},
		{name:"UrlShortener",component:UrlShortener,options:{headerTitle:"URL Shortener"}},
		{name:"Contact",component:Contact,options:{headerTitle:"Contact"}},
		{name:"BlogList",component:BlogList,options:{headerTitle:"Blog"}},
		{name:"SearchFilter",component:SearchFilter,options:{headerTitle:"Search"}},
		{name:"Twibbon",component:Twibbon,options:{headerTitle:"Twibbon"}},
		{name:"TwibbonDetail",component:TwibbonDetail,options:{headerTitle:"Twibbon"}},
		{name:"User",component:User},
		{name:"OpenSource",component:OpenSource,options:{headerTitle:"Open Source"}},
		{name:"OpenSourceDetail",component:OpenSourceDetail,options:{headerTitle:"Open Source"}},
		{name:"SecondScreen",component:SecondScreen,options:{headerShown:false}},
		{name:"NotificationEvent",component:NotificationEvent,options:{headerTitle:"Notification"}},
		{name:"ReportScreen",component:ReportScreen,options:{headerTitle:"Report"}},
		//{name:"Comments",component:Comments,options:{headerTitle:"Comment"}},
		{name:"Setting",component:Setting,options:{headerTitle:"Setting"}},
		{name:"AccountSettingScreen",component:AccountSettingScreen,options:{headerTitle:"Account Setting"}},
		{name:"SecuritySettingScreen",component:SecuritySettingScreen,options:{headerTitle:"Security Setting"}},
		{name:"NotificationSettingScreen",component:NotificationSettingScreen,options:{headerTitle:"Notification Setting"}},
		{name:"LikeFilter",component:LikeFilter,options:{headerTitle:"Like"}},
		{name:"Like",component:Like,options:{headerTitle:"Like"}},
		{name:"Media",component:MediaScreen,options:{headerTitle:"Media"}},
		{name:"EditUserScreen",component:EditUserScreen,options:{gestureEnabled:false,headerTitle:"Edit Profile"}},
		{name:"DownloadFileScreen",component:DownloadFileScreen,options:{headerTitle:"Download"}},
		{name:"ImageModal",component:ImageModal,options:{gestureEnabled:true,headerShown:false,gestureDirection:'vertical',...TransitionPresets.ModalSlideFromBottomIOS}}
	]
}

const HomeStack = createStackNavigator();
const NewsStack = createStackNavigator();
const ChordStack = createStackNavigator();
const SearchStack = createStackNavigator();
const MenuStack = createStackNavigator();

const HomeScreenStack = ()=>{
	const theme=useTheme();
	const {user} = useSelector(state=>({user:state.user}))
	const renderScreen=React.useCallback(()=>{
		return getScreen().map((dt,i)=>(
			<HomeStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))
	},[user])
	return (
		<HomeStack.Navigator initialRouteName="Home" headerMode="float" screenOptions={getScreenOptions(theme)}>
			<HomeStack.Screen  name="Home" component={Home} options={{headerShown:false}} />
			{renderScreen()}
		</HomeStack.Navigator>
	)
}
const NewsScreenStack = ()=>{
	const theme=useTheme();
	const {user} = useSelector(state=>({user:state.user}))
	const renderScreen=React.useCallback(()=>{
		return getScreen().map((dt,i)=>(
			<NewsStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))
	},[user])
	return (
		<NewsStack.Navigator initialRouteName="News" headerMode="float" screenOptions={getScreenOptions(theme)}>
			<NewsStack.Screen  name="News" component={News} />
			{renderScreen()}
		</NewsStack.Navigator>
	)
}
const ChordScreenStack = ()=>{
	const theme=useTheme();
	const {user} = useSelector(state=>({user:state.user}))
	const renderScreen=React.useCallback(()=>{
		return getScreen().map((dt,i)=>(
			<ChordStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))
	},[user])
	return (
		<ChordStack.Navigator initialRouteName="Chord" headerMode="float" screenOptions={getScreenOptions(theme)}>
			<ChordStack.Screen  name="Chord" component={Chord} />
			{renderScreen()}
		</ChordStack.Navigator>
	)
}
const SearchScreenStack = ()=>{
	const theme=useTheme();
	const {user} = useSelector(state=>({user:state.user}))
	const renderScreen=React.useCallback(()=>{
		return getScreen().map((dt,i)=>(
			<SearchStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))
	},[user])
	return (
		<SearchStack.Navigator initialRouteName="Search" headerMode="float" screenOptions={getScreenOptions(theme)}>
			<SearchStack.Screen  name="Search" component={Search} />
			{renderScreen()}
		</SearchStack.Navigator>
	)
}
const MenuScreenStack = ()=>{
	const theme=useTheme();
	const {user} = useSelector(state=>({user:state.user}))
	const renderScreen=React.useCallback(()=>{
		return getScreen().map((dt,i)=>(
			<MenuStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))
	},[user])
	return (
		<MenuStack.Navigator initialRouteName="Menu" headerMode="float" screenOptions={getScreenOptions(theme)}>
			<MenuStack.Screen  name="Menu" component={Menu} />
			{renderScreen()}
		</MenuStack.Navigator>
	)
}

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const tabLabel=(label)=>({focused,color})=>{
	if(!focused) return null;
	return (
		<Text style={{fontSize:12,fontFamily:"Inter_Bold",color}}>{label}</Text>
	)
}

const MainTabNavigator=()=>{
	const theme=useTheme();
	const musicPlayer = useSelector(state=>state.musicPlayer);
	return (
		<Tabs.Navigator
			initialRouteName="HomeStack"
			backBehavior="initialRoute"
			tabBarOptions={{
				keyboardHidesTabBar:true,
				tabStyle:{paddingVertical:5},
				style:{backgroundColor:theme['background-basic-color-1'],borderTopColor:theme['border-basic-color'],height:54,...(musicPlayer ? {marginBottom:80} : {})},
				inactiveTintColor:theme['text-hint-color'],
				activeTintColor:theme['color-indicator-bar'],
				allowFontScaling:true,
			}}
			lazy={false}
		>
			<Tabs.Screen options={{tabBarLabel:tabLabel("Home"),tabBarIcon:tabBarIcon('home')}} name="HomeStack" component={HomeScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("News"),tabBarIcon:tabBarIcon('news')}} name="NewsStack" component={NewsScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Search"),tabBarIcon:tabBarIcon('search')}} name="SearchStack" component={SearchScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Chord"),tabBarIcon:tabBarIcon('chord')}} name="ChordStack" component={ChordScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Menu"),tabBarIcon:tabBarIcon('menu')}} name="MenuStack" component={MenuScreenStack} />
		</Tabs.Navigator>
	)
}

const MainNavigator=()=>{
	const theme=useTheme();
	return (
		<MainStack.Navigator initialRouteName="MainTab" screenOptions={{
			headerShown:false,
			gestureEnabled:true,
			...TransitionPresets.SlideFromRightIOS
		}}>
			<MainStack.Screen name="MainTab" component={MainTabNavigator} />
			<MainStack.Screen name="ReportScreen" component={ReportScreen} options={{headerShown:true}} />
			<MainStack.Screen name="Login" component={Login} />
			<MainStack.Screen name="Register" component={Register} />
			<MainStack.Screen name="Authentication" component={Authentication} />
			<MainStack.Screen name="ForgetPassword" component={ForgetPassword} />
			<MainStack.Screen name="ForgetPasswordForm" component={ForgetPasswordForm} />
			<MainStack.Screen name="Comments" component={Comments} options={getScreenOptions(theme)} />
		</MainStack.Navigator>
	)
}

export default React.memo(() => {
	const {navigationRef} = useRootNavigation();
	const routeNameRef = React.useRef(null)
	const auth = useContext(AuthContext);
	const {setNotif} = auth;
	const {user,session,selectedTheme} = useSelector(state=>({user:state.user,session:state.session,selectedTheme:state.theme}))
	const theme=useTheme()
	const {PNpost} = useAPI();
	const {showAds} = showInterstisial();
	const [ready,setReady]=React.useState(false);
	const [lock,setLock] = React.useState(false);
	const lastNotif = Notifications.useLastNotificationResponse();

	function onReady(){
		routeNameRef.current = navigationRef.current.getCurrentRoute().name
		setReady(true);
	}

	React.useEffect(()=>{
		if(ready) {
			setStatusBarStyle(selectedTheme==='light' ? "dark" : "light");
			setStatusBarBackgroundColor(theme['background-basic-color-1']);
		}
	},[ready,selectedTheme])

	async function onStateChange(){
		const prevRouteName = routeNameRef.current;
		const currentRouteName = navigationRef.current.getCurrentRoute().name
		if(prevRouteName !== currentRouteName && !__DEV__) {
			await analytics().logScreenView({
				screen_class: currentRouteName,
				screen_name: currentRouteName
			})
		}
		if(screenChange === 7) {
			const random = Math.floor(Math.random() * 2);
			screenChange = 0;
			if(random === 0 && disableAdsArr.indexOf(currentRouteName) === -1 && !__DEV__) showAds();
		} else {
			screenChange += 1;
		}
	}

	React.useEffect(()=>{
		async function checkInitial(){
			//Init Notification
			const {status:existingStatus} = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if(finalStatus !== 'granted') {
				const {status} = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			if(finalStatus === 'granted') {
				try {
					const notif_token = await messaging().getToken();
					console.log("Notification token",notif_token);
					if(!__DEV__) {
						PNpost('/send_notification_token',{token: notif_token},undefined,false);
					}
				} catch(err) {
					logError(err,"Get notification token AppNavigator.js");
				}
			}
		}

		if(ready) {
			checkInitial();
			checkAndUpdateOTA()
		}
	},[ready,PNpost])

	React.useEffect(()=>{
		let onNotificationOpenListener=null,onMessageListener=null,notifResponse=null;

		/* HANDLE DEEP LINK */
		async function getInitialLink() {
			const url = await getInitialURL();
			if(typeof url === 'string') {
				if(url !== "trackplayer://notification.click") {
					const parsed = urlParse(url,true);
					if(parsed?.query?.msg) {
						setTimeout(()=>setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg),1000)
					}
					handleLinking(url);
				}
				
			}
		}
		function handleURL({url}){
			//console.log("URL",url);
			if(url !== null) {
				if(url !== "trackplayer://notification.click") {
					const parsed = urlParse(url,true);
					if(parsed?.query?.msg) {
						setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg)
					}
					handleLinking(url)
				}
			}
		}
		/* HANDLE DEEP LINK */

		/* HANDLE NOTIFICATION */
		
		function shareListener(data){
			if(data?.extraData?.url) {
				handleLinking(data?.extraData?.url);
			}
		}
		/* HANDLE NOTIFICATION */

		if(ready) {
			onMessageListener = messaging().onMessage(remote=>{
				if(remote?.data?.link) setNotif("info",remote?.notification?.title||remote?.data?.title,remote?.notification?.body||remote?.data?.body,{link:remote.data.link});
				handleFCMData(remote);
			})
			ExpoAddListener('url',handleURL)
			getInitialLink();
			ShareModule.getSharedData(false).then(shareListener);
			ShareModule.addListener(shareListener)
			onNotificationOpenListener = messaging().onNotificationOpenedApp(remote=>{
				if(remote?.data?.link) {
					handleLinking(remote?.data?.link);
				}
			})
			messaging().getInitialNotification()
			.then(remote=>{
				if(remote?.data?.link) {
					handleLinking(remote?.data?.link);
				}
			})
			notifResponse = Notifications.addNotificationResponseReceivedListener(remote=>{
				if(remote?.actionIdentifier==='mark_as_read') {
					//console.log("MARK AS READ CLICKED",remote?.notification);
				}
				if(remote?.actionIdentifier==='reply') {
					//console.log("REPLY CLICKED",remote?.notification,remote?.userText);
					const text = remote?.userText;
				}
				Notifications.dismissNotificationAsync(remote?.notification?.request?.identifier)
			})
		}
		return ()=>{
			if(typeof onNotificationOpenListener === 'function') onNotificationOpenListener();
			if(typeof onMessageListener === 'function') onMessageListener();
			if(notifResponse !== null) notifResponse.remove();
			ExpoRemoveListener('url',handleURL);
			ShareModule.removeListener(shareListener);
		}
	},[ready])

	/* Local Notification */
	React.useEffect(()=>{
		async function checkNotification(){
			if(lastNotif && lastNotif?.notification?.request?.content?.data?.url) {
				const id = lastNotif?.notification?.request?.identifier;
				const res = await AsyncStorage.getItem("last_notification");
				if(res!==id){
					const urls = lastNotif?.notification?.request?.content?.data?.url;
					await AsyncStorage.setItem("last_notification",id);
					if(typeof urls === 'string'){
						handleLinking(urls);
					}
				}
			}
		}
		if(ready) {
			checkNotification();
		}
	},[lastNotif,ready])

	React.useEffect(()=>{
		let timeout=null,llock=false;
		const unregister = async()=>{
			if(timeout !== null) {
				BgTimer.clearTimeout(timeout);
				timeout=null;
			}
			if(llock) {
				await initializeLock();
				llock=false;
				setLock(false);
			}
		}
		const listener = async(state)=>{
			if(ready) {
				if(state==="background") {
					timeout = BgTimer.setTimeout(async()=>{
						const active = await isLockedActive();
						if(active) {
							llock=true;
							setLock(true);
						}
					},60 * 1000)
				} else {
					unregister();
					if(llock) {
						await initializeLock();
					}
					llock=false;
					setLock(false);
				}
			}
		}

		AppState.addEventListener("change",listener);
		return ()=>{
			if(timeout !== null) {
				BgTimer.clearTimeout(timeout);
				timeout=null;
			}
			AppState.removeEventListener("change",listener);
		}
	},[ready])
	
	return (
		<>
			{user == null || session == null ? <Loading /> : (
				<NavigationContainer
					ref={navigationRef}
					onReady={onReady}
					onStateChange={onStateChange}
					linking={linking}
				>
					<RootStack.Navigator initialRouteName="MainStack" mode="modal" screenOptions={{
						headerShown:false,
						...TransitionPresets.ModalSlideFromBottomIOS
					}}>
						<RootStack.Screen name="MainStack" component={MainNavigator} />
						<RootStack.Screen name="ReportModal" component={ReportModal} />
					</RootStack.Navigator>
				</NavigationContainer>
			)}
			{ready && (
				<Portal>
					<MusicPlayer />
					<Modal
						isVisible={lock}
						style={{margin:0,justifyContent:'center'}}
						coverScreen={false}
					>
						<Loading />
					</Modal>
				</Portal>
			)}
		</>
	);
});