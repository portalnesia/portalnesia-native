import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import {StatusBar} from 'expo-status-bar'
import {BottomNavigation,BottomNavigationTab,Icon,useTheme,Text} from '@ui-kitten/components'
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
import TunerScreen from '../screens/Tools/Tuner'
import UrlShortener from '../screens/UrlShortener'
import Contact from '../screens/Contact'
import User from '../screens/User/User'
import EditUserScreen from '../screens/User/Edit'
import Setting from '../screens/Setting/Setting'
import AccountSettingScreen from '../screens/Setting/Account'
import SecuritySettingScreen from '../screens/Setting/Security'
import NotificationSettingScreen from '../screens/Setting/Notification'
import Search from '../screens/SearchLike/Search'
import SearchFilter from '../screens/SearchLike/SearchFilter'
import Twibbon from '../screens/Twibbon/Twibbon'
import TwibbonDetail from '../screens/Twibbon/TwibbonDetail'
import OpenSource from '../screens/OpenSource/OpenSource'
import OpenSourceDetail from '../screens/OpenSource/OpenSourceDetail'
import Comments from '../screens/Modal/Comments'
import SecondScreen from '../screens/SecondScreen'
import NotificationEvent from '../screens/Notification/NotificationEvent'
import ReportScreen from '../screens/ReportScreen'
import ReportModal from '../screens/Modal/ReportModal'
import Login from '../screens/auth/Login'
import Register from '../screens/auth/Register'
import Authentication from '../screens/auth/Authentication'
import ForgetPassword from '../screens/auth/ForgetPassword'
import ForgetPasswordForm from '../screens/auth/ForgetPasswordForm'
import { AuthContext } from '../provider/Context';


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
/* CREATE BOTTOM NAVIGATOR 


const MainStack = createStackNavigator();

const MainTabs=()=>(
	<Tabs.Navigator initialRouteName="Home" tabBar={props=><BottomTabBar {...props} />}>
		<Tabs.Screen name="Home" component={Home} />
		<Tabs.Screen name="News" component={News} />
		<Tabs.Screen name="Search" component={Search} />
		<Tabs.Screen name="Chord" component={Chord} />
		<Tabs.Screen name="Menu" component={Menu} />
	</Tabs.Navigator>
)*/

let screenChange=0;
const disableAdsArr = ["Setting","Contact","Pages",'NotFound','ImageModal','Menu','AccountSettingScreen','EditUserScreen','ReportScreen','ReportModal','Comments'];

const getScreen=()=>{
	return [
		{name:"NotFound",component:NotFound},
		{name:"NewsDetail",component:NewsDetail},
		{name:"ChordDetail",component:ChordDetail},
		{name:"ChordList",component:ChordList},
		{name:"Pages",component:Pages},
		{name:"Blog",component:Blog},
		{name:"BlogDetail",component:BlogDetail},
		{name:"Twitter",component:Twitter},
		{name:"TwitterThread",component:TwitterThread},
		{name:"GeodataTransform",component:GeodataTransform},
		{name:"NumberGenerator",component:NumberGenerator},
		{name:"ParseHtml",component:ParseHtml},
		{name:"ImagesChecker",component:ImagesChecker},
		{name:"Tuner",component:TunerScreen},
		{name:"QrGenerator",component:QrGenerator},
		{name:"UrlShortener",component:UrlShortener},
		{name:"Contact",component:Contact},
		{name:"BlogList",component:BlogList},
		{name:"SearchFilter",component:SearchFilter},
		{name:"Twibbon",component:Twibbon},
		{name:"TwibbonDetail",component:TwibbonDetail},
		{name:"User",component:User},
		{name:"OpenSource",component:OpenSource},
		{name:"OpenSourceDetail",component:OpenSourceDetail},
		{name:"SecondScreen",component:SecondScreen},
		{name:"NotificationEvent",component:NotificationEvent},
		{name:"ReportScreen",component:ReportScreen},
		{name:"Comments",component:Comments},
		{name:"Setting",component:Setting},
		{name:"AccountSettingScreen",component:AccountSettingScreen},
		{name:"SecuritySettingScreen",component:SecuritySettingScreen},
		{name:"NotificationSettingScreen",component:NotificationSettingScreen},
		{name:"ImageModal",component:ImageModal,options:{gestureEnabled:true,gestureDirection:'vertical',...TransitionPresets.ModalSlideFromBottomIOS}}
	]
}

const HomeStack = createStackNavigator();
const NewsStack = createStackNavigator();
const ChordStack = createStackNavigator();
const SearchStack = createStackNavigator();
const MenuStack = createStackNavigator();

const HomeScreenStack = ()=>(
	<HomeStack.Navigator initialRouteName="Home" screenOptions={{
		headerShown: false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<HomeStack.Screen  name="Home" component={Home} />
		{getScreen().map((dt,i)=>(
			<HomeStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))}
	</HomeStack.Navigator>
)
const NewsScreenStack = ()=>(
	<NewsStack.Navigator initialRouteName="News" screenOptions={{
		headerShown: false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<NewsStack.Screen  name="News" component={News} />
		{getScreen().map((dt,i)=>(
			<NewsStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))}
	</NewsStack.Navigator>
)
const ChordScreenStack = ()=>(
	<ChordStack.Navigator initialRouteName="Chord" screenOptions={{
		headerShown: false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<ChordStack.Screen  name="Chord" component={Chord} />
		{getScreen().map((dt,i)=>(
			<ChordStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))}
	</ChordStack.Navigator>
)
const SearchScreenStack = ()=>(
	<SearchStack.Navigator initialRouteName="Search" screenOptions={{
		headerShown: false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<SearchStack.Screen  name="Search" component={Search} />
		{getScreen().map((dt,i)=>(
			<SearchStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))}
	</SearchStack.Navigator>
)
const MenuScreenStack = ()=>(
	<MenuStack.Navigator initialRouteName="Menu" screenOptions={{
		headerShown: false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<MenuStack.Screen  name="Menu" component={Menu} />
		{getScreen().map((dt,i)=>(
			<MenuStack.Screen key={i} name={dt?.name} component={dt?.component} {...(dt?.options ? {options:dt?.options} : {})} />
		))}
	</MenuStack.Navigator>
)

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
	return (
		<Tabs.Navigator
			initialRouteName="HomeStack"
			/*activeColor={theme['color-indicator-bar']}
			inactiveColor={theme['text-hint-color']}
			shifting={true}
			barStyle={{backgroundColor:theme['background-basic-color-1'],borderTopColor:theme['border-basic-color'],borderTopWidth:1,height:54}}
			*/
			//tabBar={props=><BottomTabBar {...props} />}
			tabBarOptions={{
				keyboardHidesTabBar:true,
				tabStyle:{paddingVertical:5},
				style:{backgroundColor:theme['background-basic-color-1'],borderTopColor:theme['border-basic-color'],height:54},
				inactiveTintColor:theme['text-hint-color'],
				activeTintColor:theme['color-indicator-bar'],
				allowFontScaling:true
			}}

		>
			<Tabs.Screen options={{tabBarLabel:tabLabel("Home"),tabBarIcon:tabBarIcon('home')}} name="HomeStack" component={HomeScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("News"),tabBarIcon:tabBarIcon('news')}} name="NewsStack" component={NewsScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Search"),tabBarIcon:tabBarIcon('search')}} name="SearchStack" component={SearchScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Chord"),tabBarIcon:tabBarIcon('chord')}} name="ChordStack" component={ChordScreenStack} />
			<Tabs.Screen options={{tabBarLabel:tabLabel("Menu"),tabBarIcon:tabBarIcon('menu')}} name="MenuStack" component={MenuScreenStack} />
		</Tabs.Navigator>
	)
}

const MainNavigator=()=>(
	<MainStack.Navigator initialRouteName="MainTab" screenOptions={{
		headerShown:false,
		gestureEnabled:true,
		...TransitionPresets.SlideFromRightIOS
	}}>
		<MainStack.Screen name="MainTab" component={MainTabNavigator} />
		<MainStack.Screen name="ReportScreen" component={ReportScreen} />
		<MainStack.Screen name="EditUserScreen" component={EditUserScreen} options={{gestureEnabled:false}} />
		<MainStack.Screen name="Login" component={Login} />
		<MainStack.Screen name="Register" component={Register} />
		<MainStack.Screen name="Authentication" component={Authentication} />
		<MainStack.Screen name="ForgetPassword" component={ForgetPassword} />
		<MainStack.Screen name="ForgetPasswordForm" component={ForgetPasswordForm} />
	</MainStack.Navigator>
)

export default React.memo(() => {
	const {navigationRef} = useRootNavigation();
	const routeNameRef = React.useRef(null)
	const auth = useContext(AuthContext);
	const {state,theme:selectedTheme} = auth;
	const {user,session} = state
	const theme=useTheme()
	//const [ready,setReady]=React.useState(false);
	const {showAds} = showInterstisial();

	function onReady(){
		//setReady(true);
		routeNameRef.current = navigationRef.current.getCurrentRoute().name
	}

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
			if(random === 0 && disableAdsArr.indexOf(currentRouteName) === -1) showAds();
		} else {
			screenChange += 1;
		}
	}
	
	return (
		<>
			<StatusBar animated style={user === null || session == null ? 'light' : (selectedTheme==='light' ? "dark" : "light")} translucent animated backgroundColor={user === null || session == null ? theme['color-primary-500'] : theme['background-basic-color-1']} />
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
		</>
	);
});