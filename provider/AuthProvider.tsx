import React, { useRef, useEffect, useReducer } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import { CustomSchemaType } from '@eva-design/dss';
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
import * as Applications from 'expo-application'
import NetInfo from '@react-native-community/netinfo'
import useRootNavigation,{handleLinking,getPath} from '../navigation/useRootNavigation'
import {useColorScheme,PermissionsAndroid,LogBox,StyleSheet} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Secure from 'expo-secure-store'
import {PortalProvider} from'@gorhom/portal'
import RNFS from 'react-native-fs'
import {captureScreen} from 'react-native-view-shot'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import {requestPermissionsAsync as AdsRequest} from 'expo-ads-admob'
import 'moment/locale/id';
import AppLoading from 'expo-app-loading';
import AppNavigator from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

import verifyApps from '@pn/utils/VerifyApps'
import {useSelector,changeLang,changeTheme,useDispatch} from '@pn/provider/actions'
import * as Notifications from 'expo-notifications'
import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
import i18n from 'i18n-js'
import {AuthContext} from './Context'
import useLogin,{refreshingToken} from '@pn/utils/Login'
import Localization from '@pn/module/Localization'
import useForceUpdate from '@pn/utils/useFoceUpdate'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'
import loadResources from '@pn/utils/Assets'
import { logError,log } from '@pn/utils/log';
import { UserType } from '@pn/types/UserTypes';
import { TokenResponse } from 'expo-auth-session';

const customMap = (mapping as any)
LogBox.ignoreLogs(['Setting a timer for a long period of time']);

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:true,
        shouldSetBadge:true
    })
})

const getNotifOption=(id: string,desc: string)=>({
	name:id,
	description:desc,
	importance:Notifications.AndroidImportance.HIGH,
	lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC,
	sound:'default',
	vibrationPattern:[250],
	enableVibrate:true
})

const AuthProviderFunc = () => {
	const dropdownRef=useRef(null)
	const currentInternet=useRef(true);
	const colorScheme = useColorScheme()
	const forceUpdate = useForceUpdate();
	const {navigationRef} = useRootNavigation()
	const [isLoadingComplete, setLoadingComplete] = React.useState(false);
	const dispatch = useDispatch();
	const {refreshToken} = useLogin()
	const context = useSelector(type=>({theme:type.theme,userTheme:type.userTheme,lang:type.lang,user:type.user,isLogin:type.isLogin}));
	
	const setNotif=React.useCallback((type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data: {[key: string]: any} = {})=>{
		let tipe=type;
		if(typeof type === 'boolean') {
			tipe = type===true ? 'error' : 'success'
		}
		dropdownRef.current?.alertWithType(tipe||'success',title||"Title",msg,{type:'alert',...data});
	},[])

	const setTheme=React.useCallback(async(val: 'auto'|'dark'|'light')=>{
		if(['light','auto','dark'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("theme",val)
				const theme=(colorScheme==='dark' && val === 'auto' || val === 'dark') ? "dark" : "light";
				dispatch(changeTheme(theme,val));
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	},[colorScheme,dispatch])

	const setLang=React.useCallback(async(val: 'auto'|'en'|'id')=>{
		if(['id','auto','en'].indexOf(val) !== -1) {
			try {
				await AsyncStorage.setItem("lang",val)
				dispatch(changeLang(val));
			} catch(e) {
				setNotif(true,"Error",i18n.t('errors.general'))
			}
		}
	},[dispatch])

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

	const loadResourcesAsync=React.useCallback(async()=>{
		async function asyncTask(){
			try {
				await verifyApps();
				let [res,lang,ads] = await Promise.all([AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang"),AsyncStorage.getItem("ads")])

				if(res !== null) {
					const theme=(colorScheme==='dark' && res === 'auto' || res === 'dark') ? "dark" : "light";
					dispatch(changeTheme(theme,(res as 'dark'|'light'|'auto')));
				} else {
					const theme=(colorScheme==='dark') ? "dark" : "light";
					dispatch(changeTheme(theme,'auto'));
				}
				if(lang !== null) {
					dispatch(changeLang((lang as 'auto'|'en'|'id')));
				} else {
					dispatch(changeLang('auto'));
				}
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
			} catch(err: any){
				log("asyncTask AuthProvider.js",{msg:err?.message});
        		logError(err,"asyncTask AuthProvider.js");
				// PR
				dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				return Promise.resolve();
			}
		};
		await loadResources();
		await asyncTask();
		return Promise.resolve();
	},[dispatch,context.userTheme])

	useEffect(()=>{
		async function setNotificationChannel(){
			try {
				await Promise.all([
					Notifications.setNotificationChannelAsync("Download", getNotifOption("Download","Notifications for background download services")),
					Notifications.setNotificationChannelAsync("General", getNotifOption("General","General notifications")),
					Notifications.setNotificationChannelAsync("News", getNotifOption("News","Notifications for the latest news every day")),
					Notifications.setNotificationChannelAsync("Features", getNotifOption("Features","New features and promotion on Portalnesia")),
					Notifications.deleteNotificationChannelAsync("Features & Promotion")
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
		
		if(context.user !== null) {
			setNotificationChannel();
			createFolder();
		}
		
		
		return ()=>{
			netInfoListener();
		}
	},[context.user])

	/* LOCALIZATION */
	useEffect(()=>{
		function onLocalizationChange(){
			i18n.translations = {
				en:en_locale,
				id:id_locale
			};
			i18n.fallbacks = true;
			if(['id','en'].indexOf(context.lang) !== -1) {
				const lng = context.lang === 'id' ? "id-ID" : "en-US";
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
	},[context.lang])

	/* HANDLE AUTHENTICATION TOKEN */
	useEffect(()=>{
		let interval:NodeJS.Timeout|null=null;
		async function handleRefreshToken(){
			const token_string = await Secure.getItemAsync('token');
			if(token_string!==null) {
				const token = JSON.parse(token_string);
				const date_now = Number((new Date().getTime()/1000).toFixed(0));
				console.log("Refresh Token",date_now - token.issuedAt,(token.expiresIn||3600) - 300)
				if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
					const new_token = await refreshingToken(token);
					if(new_token) {
						await Secure.setItemAsync('token',JSON.stringify(new_token));
						dispatch({type:"MANUAL",payload:{token:new_token}})
					}
				}
			}
		}
		function handleInterval(){
			interval = setInterval(handleRefreshToken,295 * 1000)
		}
		if(context.isLogin) {
			//if(currentState.match(/inactive|background/)) handleRefreshToken();
			handleInterval();
		}

		return ()=>{
			if(interval !== null) clearInterval(interval)
			interval=null;
		}
	},[context.isLogin,dispatch])

	const onTap=React.useCallback((dt)=>{
		const urls = dt?.payload?.link
		if(urls) {
			handleLinking(urls);
		}
	},[])

	if (!isLoadingComplete) {
		return (
			<>
				<AppLoading
					startAsync={loadResourcesAsync}
					onError={(err)=>handleLoadingError(err,setLoadingComplete)}
					onFinish={() => handleFinishLoading(setLoadingComplete)}
				/>
			</>
		);
	}

	return (
		<SafeAreaView style={[styles.container]}>
			<AuthContext.Provider
				value={{
					setNotif,
					setTheme,
					setLang,
					sendReport,
				}}
			>
				<IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
				<ApplicationProvider {...eva} theme={{...eva[context.theme],...theme[context.theme]}} customMapping={(customMap as CustomSchemaType)}>
					<PortalProvider>
						<AppNavigator />
					</PortalProvider>
					<DropdownAlert
						successColor='#2f6f4e'
						activeStatusBarStyle='light-content'
						inactiveStatusBarStyle={context.theme === 'light' ? "dark-content" : "light-content"}
						inactiveStatusBarBackgroundColor={context.theme==='light' ? "#FFFFFF" : "#222B45"}
						onTap={onTap}
						renderImage={()=>null}
						ref={dropdownRef} />
				</ApplicationProvider>
			</AuthContext.Provider>
		</SafeAreaView>
	);
};

function handleLoadingError(error: any,setLoadingComplete: React.Dispatch<React.SetStateAction<boolean>>) {
	// In this case, you might want to report the error to your error reporting
	// service, for example Sentry
	logError(error,"Splashscreen error")
	setLoadingComplete(true);
}

function handleFinishLoading(setLoadingComplete: React.Dispatch<React.SetStateAction<boolean>>) {
	setLoadingComplete(true);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

const AuthProvider = React.memo(AuthProviderFunc)

export { AuthProvider };
export default AuthProviderFunc
