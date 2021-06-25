import React, { useRef, useEffect, useReducer } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../../theme.json';
import {default as mapping} from '../../mapping.json'
import * as Applications from 'expo-application'
import NetInfo from '@react-native-community/netinfo'
import useRootNavigation,{handleLinking,getPath} from './useRootNavigation'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme,PermissionsAndroid,LogBox} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {PortalProvider} from'@gorhom/portal'
import RNFS from 'react-native-fs'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener,getInitialURL} from 'expo-linking'
import {requestPermissionsAsync as AdsRequest} from 'expo-ads-admob'

import * as Notifications from 'expo-notifications'
import {FontAwesomeIconsPack} from '../../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../../components/utils/MaterialIconsPack'
import i18n from 'i18n-js'
import {AuthContext} from '../../provider/Context'
import useLogin from '@pn/utils/Login'
import Localization from '@pn/module/Localization'
import useForceUpdate from '@pn/utils/useFoceUpdate'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'

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
	const lastNotif = Notifications.useLastNotificationResponse();
	const isLogin=React.useMemo(()=>typeof state.user === 'object',[state.user]);
	const stateUser = React.useMemo(()=>state.user,[state.user]);
	const stateToken = React.useMemo(()=>state.token,[state.token]);
	const stateSession = React.useMemo(()=>state.session,[state.session])

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
        return;
		
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
			if(props?.main) checkAndUpdateOTA()
		})
		
		if(props?.main) {
			setNotificationChannel();
			createFolder();
		} 
		
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
			console.log("URL",url);
			if(url !== null) {
				const parsed = urlParse(url,true);
				if(parsed?.query?.msg) {
					setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg)
				}
				handleLinking(url)
			}
		}
		/* HANDLE DEEP LINK */

		if(stateUser !== null && props?.main) {
			ExpoAddListener('url',handleURL)
			setTimeout(()=>{
				getInitialLink();
			},200)
		}
		return ()=>{
			ExpoRemoveListener('url',handleURL);
		}
	},[stateToken,stateUser])

	/* Local Notification */
	React.useEffect(()=>{
		async function checkNotification(){
			if(lastNotif && lastNotif?.notification?.request?.content?.data?.url) {
				const id = lastNotif?.notification?.request?.identifier;
				const res = await AsyncStorage.getItem("last_notification");
				if(res!==id){
					const urls = lastNotif?.notification?.request?.content?.data?.url;
					if(typeof urls === 'string'){
						handleLinking(urls);
					}
					await AsyncStorage.setItem("last_notification",id);
				}
			}
		}
		if(stateUser !== null && props?.main) {
			setTimeout(checkNotification,200);
		}
	},[lastNotif,stateUser])

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
