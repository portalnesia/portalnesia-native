import React, { useRef, useEffect, useReducer } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
import * as Applications from 'expo-application'
import NetInfo from '@react-native-community/netinfo'
import useRootNavigation,{getPath} from '../navigation/useRootNavigation'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme,PermissionsAndroid,Alert} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Secure from 'expo-secure-store'
import {PortalProvider} from'@gorhom/portal'
import RNFS from 'react-native-fs'
import {openBrowserAsync} from 'expo-web-browser'
import {AdsConsent, AdsConsentStatus} from '@react-native-firebase/admob'
import {captureScreen} from 'react-native-view-shot'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener} from 'expo-linking'

import {URL,ADS_PUBLISHER_ID} from '@env'
import * as Notifications from 'expo-notifications'
import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
import i18n from 'i18n-js'
import {AuthContext} from './Context'
import {API} from '@pn/utils/API'
import {checkAndUpdateOTA} from '@pn/utils/Updates'
import {refreshToken} from '@pn/utils/Login'
import Localization from '@pn/module/Localization'
import useForceUpdate from '@pn/utils/useFoceUpdate'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'
import {getLink} from '@pn/navigation/Linking'
import {UpdateEventType,addListener as UpdatesAddListener,reloadAsync as UpdatesReloadAsync} from 'expo-updates'

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
	const {linkTo,navigationRef} = useRootNavigation()

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
			const path = getPath();
			const {urlreported:urlreport,...other}=params;
			const urlreported=urlreport||path
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
		function registerNotificationToken(token,user){
			API.post('/native/send_notification_token',`token=${token?.data}`,{...(user !==null ? {headers:{'X-Session-Id':user?.session_id}} : {})})
		}
		async function asyncTask(){
			try {
				let [user,res,lang] = await Promise.all([Secure.getItemAsync('user'),AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang")])

				const token = await refreshToken()
				if(user !== null) {
					user = JSON.parse(user);
				}
				//Set Theme
				if(res !== null) setTema(res);
				if(lang !== null) changeLang(lang);

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
						registerNotificationToken(notif_token,user);
					} catch(err) {
						console.log(err.message);
					}
				}

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

				//Dispatch reducer
				if(token !== null) {
					dispatch({ type:"MANUAL",payload:{user:user,token:token,session:user?.session_id}})
				} else {
					dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				}
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
				const link = getLink(url,false);
				linkTo(link,false)
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

		async function restartApplication(){
			try {
				await UpdatesReloadAsync();
			} catch(e){

			}
		}

		const updateListener = UpdatesAddListener((update)=>{
			if(update.type === UpdateEventType.UPDATE_AVAILABLE && update.manifest?.version !== Constants.manifest.version) {
				Alert.alert(
					"New Bundle Version Updates",
					`A new bundle version has been downloaded.\nRestart the application to apply changes!\nv${update.manifest?.version}`,
					[{
						text:"Later",
						onPress:()=>{}
					},{
						text:"Restart",
						onPress:restartApplication
					}]
				)
			}
		})

		asyncTask().then(()=>{
			checkAndUpdateOTA();
		})
		setNotificationChannel();
		createFolder();
		ExpoAddListener('url',handleURL)

		const tokenChangeListener = Notifications.addPushTokenListener(registerNotificationToken);
		const foregroundListener = Notifications.addNotificationReceivedListener(showLocalBannerNotification);

		return ()=>{
			tokenChangeListener.remove();
			foregroundListener.remove();
			netInfoListener();
			ExpoRemoveListener('url',handleURL)
			updateListener.remove()
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
					if(urls?.match(/\/corona+/)) {
						const url = urls?.replace(/^pn\:\/\//,"https://portalnesia.com/");
						openBrowserAsync(url,{
							enableDefaultShare:true,
							toolbarColor:'#2f6f4e',
							showTitle:true
						})
					} else {
						const url = getLink(urls,false);
						linkTo(url,false);
					}
					await AsyncStorage.setItem("last_notification",id);
				}
			}
		}
		setTimeout(checkNotification,500)
	},[lastNotif])

	const onTap=(dt)=>{
		const urls = dt?.payload?.url
		if(urls) {
			if(urls?.match(/\/corona+/)) {
				const url = urls?.replace("pn://","https://portalnesia.com/");
				return openBrowserAsync(url,{
					enableDefaultShare:true,
					toolbarColor:'#2f6f4e',
					showTitle:true
				})
			}
			const url = getLink(urls,false);
			linkTo(url,false);
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
