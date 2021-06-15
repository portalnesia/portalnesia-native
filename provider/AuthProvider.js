import React, { useRef, useEffect, useReducer } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
import * as Applications from 'expo-application'
import NetInfo from '@react-native-community/netinfo'
import useRootNavigation,{handleLinking,getPath} from '../navigation/useRootNavigation'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme,PermissionsAndroid,LogBox} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Secure from 'expo-secure-store'
import {PortalProvider} from'@gorhom/portal'
import RNFS from 'react-native-fs'
import {captureScreen} from 'react-native-view-shot'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener,getInitialURL} from 'expo-linking'
import messaging from '@react-native-firebase/messaging'
import {requestPermissionsAsync as AdsRequest} from 'expo-ads-admob'

import {URL,ADS_PUBLISHER_ID,CLIENT_ID} from '@env'
import * as Notifications from 'expo-notifications'
import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
import i18n from 'i18n-js'
import {AuthContext} from './Context'
import {API} from '@pn/utils/API'
import {checkAndUpdateOTA} from '@pn/utils/Updates'
import useLogin,{getProfile,refreshingToken} from '@pn/utils/Login'
import Localization from '@pn/module/Localization'
import useForceUpdate from '@pn/utils/useFoceUpdate'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'
import useAppState from '@pn/utils/useAppState';
import handleFCMData from '@pn/services/FCMservices';

LogBox.ignoreLogs(['Setting a timer for a long period of time']);

const urlParse = require('url-parse')

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:true,
        shouldSetBadge:true
    })
})

const getNotifOption=(id)=>({
	name:id,
	importance:Notifications.AndroidImportance.HIGH,
	lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC,
	sound:'default',
	vibrationPattern:[250],
	enableVibrate:true
})

const reducer=(prevState,action)=>{
	switch(action?.type){
		case "LOGIN":
			return {
				...prevState,
				user:action.payload.user,
				token:action.payload.token,
				session:action.payload.session
			}
		case "LOGOUT":
			return {...prevState,user:false,token:null,session:Applications.androidId}
		case "SESSION":
			return {...prevState,session:action.payload}
		case "MANUAL":
			return {
				...prevState,
				...action.payload
			}
		default:
			return {...prevState}
	}
}

const initialState={
	user:null,
	token:null,
	session:null
}

const AuthProviderFunc = (props) => {
	const dropdownRef=useRef(null)
	const currentInternet=useRef(true);
	const [state,dispatch]=useReducer(reducer,initialState)
	const colorScheme = useColorScheme()
	const [tema,setTema]=React.useState('auto')
	const [lang,changeLang]=React.useState("auto");
	const forceUpdate = useForceUpdate();
	const {navigationRef} = useRootNavigation()
	const {refreshToken} = useLogin({dispatch,setNotif})
	const [appState,currentState] = useAppState();
	const isLogin=React.useMemo(()=>typeof state.user === 'object',[state.user]);
	const stateUser = React.useMemo(()=>state.user,[state.user]);
	const stateToken = React.useMemo(()=>state.token,[state.token]);
	const stateSession = React.useMemo(()=>state.session,[state.session])
	//const isReady = React.useMemo(()=>state.user !== null,[state.user]);

	const selectedTheme = React.useMemo(()=>{
		if(colorScheme==='dark' && tema === 'auto' || tema === 'dark') return 'dark';
		return 'light'
	},[colorScheme,tema])

	const setTheme=React.useCallback(async(val)=>{
		if(['light','auto','dark'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("theme",val)
				setTema(val)
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	},[])

	const setLang=React.useCallback(async(val)=>{
		if(['id','auto','en'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("lang",val)
				changeLang(val)
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	},[])

	const setNotif=React.useCallback((type,title,msg,data={})=>{
		let tipe=type;
		if(typeof type === 'boolean') {
			tipe = type===true ? 'error' : 'success'
		}
		dropdownRef.current.alertWithType(tipe||'success',title||"Title",msg,{type:'alert',...data});
	},[])

	const sendReport=React.useCallback((type,params={})=>{
		const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"1.5.0",">=");
		if(isUpdated) {
			const title = ['konten','komentar','url'].indexOf(type) !== -1 ? "Send Report" : "Send Feedback";
			const {urlreported:urlreport,...other}=params;
			const urlreported=urlreport||getPath()
			captureScreen({format:'png',quality:0.9})
			.then(
				uri=>{
					navigationRef?.current?.navigate("ReportScreen",{title,uri,type,urlreported,...other})
				},
				error=>{
					console.log("capture error",error)
					setNotif(true,"Error","Something went wrong");
				}
			)
		} else {
			setNotif(true,"Error","Please update your apps to the latest version");
		}
	},[navigationRef])

	useEffect(()=>{
		async function asyncTask(){
			try {
				let [res,lang,ads] = await Promise.all([AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang"),AsyncStorage.getItem("ads")])

				if(res !== null) setTema(res);
				if(lang !== null) changeLang(lang);

				try {
					if(ads==null) {
						const permiss = await AdsRequest();
						if(permiss.status==='denied') {
							await AsyncStorage.setItem('ads','false');
						}
					}
				} catch(e){}

				await refreshToken();
				return Promise.resolve();
			} catch(err){
				console.log("Init Err",err);
				dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				return;
			}
		};

		async function setNotificationChannel(){
			try {
				await Promise.all([
					Notifications.setNotificationChannelAsync("Download", getNotifOption("Download")),
					Notifications.setNotificationChannelAsync("General", getNotifOption("General")),
					Notifications.setNotificationChannelAsync("News", getNotifOption("News")),
				])
			} catch(e){
				console.log("Notification channel error",e);
			}
			
		}

		async function createFolder() {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
			if(granted === PermissionsAndroid.RESULTS.GRANTED) {
				const ada = await RNFS.exists(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia`);
				if(!ada) {
					await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia`)
				}
			}
		}

		const netInfoListener = NetInfo.addEventListener(state=>{
			if(state.isInternetReachable && !currentInternet.current) {
				setNotif(false,i18n.t('net_online'));
				currentInternet.current=true;
			} else if(!state.isInternetReachable && currentInternet.current) {
				setNotif(true,i18n.t('net_offline'));
				currentInternet.current=false;
			}
		})

		asyncTask().then(()=>{
			checkAndUpdateOTA()
		})
		setNotificationChannel();
		createFolder();

		return ()=>{
			netInfoListener();
		}
	},[])

	/* LOCALIZATION */
	useEffect(()=>{
		function onLocalizationChange(){
			i18n.translations = {
				en:en_locale,
				id:id_locale
			};
			i18n.fallbacks = true;
			if(['id','en'].indexOf(lang) !== -1) {
				const lng = lang === 'id' ? "id-ID" : "en-US";
				i18n.locale =lng;
			} else {
				i18n.locale = Localization.getLocales()[0].languageTag;
			}
			forceUpdate();
		}

		onLocalizationChange();
		Localization.addEventListener('localizationChange',onLocalizationChange)

		return ()=>{
			Localization.removeEventListener('localizationChange',onLocalizationChange)
		}
	},[lang])

	/* NOTIFICATION & DEEP LINK */
	useEffect(()=>{
		/* HANDLE DEEP LINK */
		async function getInitialLink() {
			const url = await getInitialURL();
			if(typeof url === 'string') {
				const parsed = urlParse(url,true);
				if(parsed?.query?.msg) {
					setTimeout(()=>setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg),1000)
				}
				handleLinking(url);
			}
		}
		function handleURL({url}){
			if(url !== null) {
				const parsed = urlParse(url,true);
				if(parsed?.query?.msg) {
					setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg)
				}
				handleLinking(url)
			}
		}
		/* HANDLE DEEP LINK */

		/* HANDLE NOTIFICATION */
		function registerNotificationToken(token){
			if(!__DEV__) {
				if(stateToken) {
					API.post('/native_secure/send_notification_token',`token=${token?.data}`,{
						headers:{
							'X-Session-Id':Applications.androidId,
							'Authorization':`Bearer ${stateToken?.accessToken}`,
							'PN-Client-Id':CLIENT_ID
						}
					});
				} else {
					API.post('/native/send_notification_token',`token=${token}`)
				}
			}
		}
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
					registerNotificationToken(notif_token);
				} catch(err) {
					console.log("Notification token error",err.message);
				}
			}
		}
		async function handleLNotification(url){
			handleLinking(url);
		}
		/* HANDLE NOTIFICATION */

		checkInitial();
		const onNotificationOpenListener = messaging().onNotificationOpenedApp(remote=>{
			if(remote?.data?.link) {
				handleLNotification(remote.data.link);
			}
		})
		const onMessageListener = messaging().onMessage(remote=>{
			if(remote?.data?.link) setNotif("info",remote.notification.title,remote.notification.body,{link:remote.data.link});
			handleFCMData(remote);
		})
		ExpoAddListener('url',handleURL)
		setTimeout(()=>{
			messaging().getInitialNotification()
			.then(remote=>{
				if(remote) {
					console.log("INITIAL_NOTIF",remote);
					if(remote?.data?.link) {
						handleLNotification(remote.data.link);
					}
				}
			})
			getInitialLink();
		},200)
		return ()=>{
			onNotificationOpenListener();
			onMessageListener();
			ExpoRemoveListener('url',handleURL)
		}
	},[stateToken])

	/* HANDLE AUTHENTICATION TOKEN */
	React.useEffect(()=>{
		let interval=null;
		async function handleRefreshToken(){
			const token_string = await Secure.getItemAsync('token');
			if(token_string!==null) {
				const token = JSON.parse(token_string);
				const date_now = Number((new Date().getTime()/1000).toFixed(0));
				const user_string = await Secure.getItemAsync('user');
				if(user_string !== null) {
					console.log("Refresh Token",date_now - token.issuedAt,(token.expiresIn||3600) - 300)
					const user = JSON.parse(user_string);
					let new_dispatch={user,session:user?.session_id};
					if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
						const new_token = await refreshingToken(token);
						if(new_token) {
							new_dispatch.token = new_token;
							await Secure.setItemAsync('token',JSON.stringify(new_token));
						}
					}
					if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{...new_dispatch}})
				}
			}
		}
		function handleInterval(){
			interval = setInterval(handleRefreshToken,295 * 1000)
		}
		if(isLogin && appState === 'active') {
			if(currentState.match(/inactive|background/)) handleRefreshToken();
			handleInterval();
		}

		return ()=>{
			if(interval !== null) clearInterval(interval)
			interval=null;
		}
	},[isLogin,appState,currentState])

	const onTap=React.useCallback((dt)=>{
		const urls = dt?.payload?.link
		if(urls) {
			handleLinking(urls);
		}
	},[])

	return (
		<AuthContext.Provider
			value={{
				state:{
					user:stateUser,
					token:stateToken,
					session:stateSession
				},
				dispatch,
				setNotif,
				setTheme,
				theme:selectedTheme,
				userTheme:tema,
				lang,
				setLang,
				sendReport,
				isLogin
			}}
		>
			<IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
			<ApplicationProvider {...eva} theme={{...eva[selectedTheme],...theme[selectedTheme]}} customMapping={mapping}>
				<PortalProvider>
					{props.children}
				</PortalProvider>
				<DropdownAlert
					successColor='#2f6f4e'
					activeStatusBarStyle='light-content'
					inactiveStatusBarStyle={selectedTheme==='light' ? "dark-content" : "light-content"}
					inactiveStatusBarBackgroundColor={selectedTheme==='light' ? "#FFFFFF" : "#222B45"}
					onTap={onTap}
					renderImage={()=>null}
					ref={dropdownRef} />
			</ApplicationProvider>
		</AuthContext.Provider>
	);
};

const AuthProvider = React.memo(AuthProviderFunc)

export { AuthContext, AuthProvider };
