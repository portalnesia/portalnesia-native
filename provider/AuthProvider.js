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
import {useColorScheme,PermissionsAndroid,Alert} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Secure from 'expo-secure-store'
import {PortalProvider} from'@gorhom/portal'
import RNFS from 'react-native-fs'
import {AdsConsent, AdsConsentStatus} from '@react-native-firebase/admob'
import {captureScreen} from 'react-native-view-shot'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener,getInitialURL} from 'expo-linking'

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

const AuthProvider = (props) => {
	const dropdownRef=useRef(null)
	const currentInternet=useRef(true);
	const [state,dispatch]=useReducer(reducer,initialState)
	const colorScheme = useColorScheme()
	const [tema,setTema]=React.useState('auto')
	const [lang,changeLang]=React.useState("auto");
	const lastNotif = Notifications.useLastNotificationResponse()
	const forceUpdate = useForceUpdate();
	const {navigationRef} = useRootNavigation()
	const {refreshToken} = useLogin({dispatch,state,setNotif})

	const selectedTheme = React.useMemo(()=>{
		if(colorScheme==='dark' && tema === 'auto' || tema === 'dark') return 'dark';
		return 'light'
	},[colorScheme,tema])

	const setTheme=async(val)=>{
		if(['light','auto','dark'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("theme",val)
				setTema(val)
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	}

	const setLang=async(val)=>{
		if(['id','auto','en'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("lang",val)
				changeLang(val)
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	}

	const setNotif=(type,title,msg,data={})=>{
		let tipe=type;
		if(typeof type === 'boolean') {
			tipe = type===true ? 'error' : 'success'
		}
		dropdownRef.current.alertWithType(tipe||'success',title||"Title",msg,{type:'alert',...data});
	}

	const sendReport=(type,params={})=>{
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
	}

	useEffect(()=>{
		let interval=null;
		
		
		async function asyncTask(){
			try {
				let [user,res,lang] = await Promise.all([Secure.getItemAsync('user'),AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang")])

				/*const token = await refreshToken()*/
				if(user !== null) {
					user = JSON.parse(user);
				}
				//Set Theme
				if(res !== null) setTema(res);
				if(lang !== null) changeLang(lang);

				try {
					const consentInfo = await AdsConsent.requestInfoUpdate([ADS_PUBLISHER_ID])
					if(consentInfo.isRequestLocationInEeaOrUnknown && consentInfo.status == AdsConsentStatus.UNKNOWN) {
						const formResult = await AdsConsent.showForm({
							privacyPolicy:`${URL}/pages/privacy-policy`,
							withAdFree:false,
							withPersonalizedAds:true,
							withNonPersonalizedAds:true
						})
						await AsyncStorage.setItem('ads',formResult.status);
					}
				} catch(e){}

				//Dispatch reducer
				await refreshToken();
				/*if(token !== null) {
					dispatch({ type:"MANUAL",payload:{user:user,token:token,session:user?.session_id}})
				} else {
					dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				}*/
				return;
			} catch(err){
				console.log("ERR",err);
				dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				return;
			}
		};

		function showLocalBannerNotification(data){
			if(data?.request?.content?.title && data?.request?.content?.body) {
				setNotif("info",data?.request?.content?.title,data?.request?.content?.body,data?.request?.content?.data);
			}
		}

		async function setNotificationChannel(){
			await Promise.all([
				Notifications.setNotificationChannelAsync("Download", getNotifOption("Download")),
				Notifications.setNotificationChannelAsync("General", getNotifOption("General")),
				Notifications.setNotificationChannelAsync("Security", getNotifOption("Security")),
				Notifications.setNotificationChannelAsync("News", getNotifOption("News")),
			])
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
		function handleURL({url}){
			if(url !== null) {
				const parsed = urlParse(url,true);
				if(parsed?.query?.msg) {
					setNotif(parsed?.query?.msg_type==='danger' || false,"Notification",parsed?.query?.msg)
				}
				handleLinking(url)
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
			interval = setInterval(async()=>{
				const token_string = await Secure.getItemAsync('token');
				if(token_string!==null) {
					let token = JSON.parse(token_string);
					const date_now = Number((new Date().getTime()/1000).toFixed(0));
					if((date_now - token.issuedAt) > (token.expiresIn||3600 - 1200)) {
						token = await refreshingToken(token);
						if(token) {
							const user = await getProfile(token);
							await Promise.all([
								Secure.setItemAsync('token',JSON.stringify(token)),
								...(typeof user !== 'string' ? [Secure.setItemAsync('user',JSON.stringify(user))] : [])
							])
							dispatch({type:"MANUAL",payload:{token,...(typeof user !== 'string' ? {user,session:user?.session_id} : {})}})
						}
					}
				}
			},1200)
		})
		setNotificationChannel();
		createFolder();
		ExpoAddListener('url',handleURL)

		const foregroundListener = Notifications.addNotificationReceivedListener(showLocalBannerNotification);

		return ()=>{
			foregroundListener.remove();
			netInfoListener();
			ExpoRemoveListener('url',handleURL)
			if(interval !== null) clearInterval(interval);
		}
	},[])

	React.useEffect(()=>{
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

	React.useEffect(()=>{
		async function checkNotification(){
			if(lastNotif && lastNotif?.notification?.request?.content?.data?.url) {
				const id = lastNotif?.notification?.request?.identifier;
				const res = await AsyncStorage.getItem("last_notification")
				if(res !== id) {
					const urls = lastNotif?.notification?.request?.content?.data?.url
					if(typeof urls ==='string') {
						handleLinking(urls)
					}
					await AsyncStorage.setItem("last_notification",id);
				}
			}
		}

		if(state.user !== null) {
			setTimeout(checkNotification,500)
		}

	},[lastNotif,state.user])

	React.useEffect(()=>{
		function registerNotificationToken(token){
			if(!__DEV__) {
				if(state.user && state.token) {
					API.post('/native_secure/send_notification_token',`token=${token?.data}`,{
						headers:{
							'X-Session-Id':state.user?.session_id,
							'Authorization':`Bearer ${state.token?.accessToken}`,
							'PN-Client-Id':CLIENT_ID
						}
					});
				} else {
					API.post('/native/send_notification_token',`token=${token?.data}`)
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
					const notif_token = await Notifications.getDevicePushTokenAsync();
					registerNotificationToken(notif_token);
				} catch(err) {
					console.log(err.message);
				}
			}
		}

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
		if(state.user !== null) {
			setTimeout(getInitialLink,500)
		}

		checkInitial();
		const tokenChangeListener = Notifications.addPushTokenListener(registerNotificationToken);

		return ()=>{
			tokenChangeListener.remove();
		}
	},[state.user,state.token])

	const onTap=(dt)=>{
		const urls = dt?.payload?.url
		if(urls) {
			handleLinking(urls);
		}
		
	}

	return (
		<AuthContext.Provider
			value={{
				state,
				dispatch,
				setNotif,
				setTheme,
				theme:selectedTheme,
				userTheme:tema,
				lang,
				setLang,
				sendReport
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



export { AuthContext, AuthProvider };
