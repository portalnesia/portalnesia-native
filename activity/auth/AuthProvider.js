import React, { useRef, useEffect } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../../theme.json';
import {default as mapping} from '../../mapping.json'
import * as Applications from 'expo-application'
import NetInfo from '@react-native-community/netinfo'
import useRootNavigation from './useRootNavigation'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme,LogBox} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {PortalProvider} from'@gorhom/portal'
import {requestPermissionsAsync as AdsRequest} from 'expo-ads-admob'
import * as Notifications from 'expo-notifications'
import {FontAwesomeIconsPack} from '../../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../../components/utils/MaterialIconsPack'
import i18n from 'i18n-js'
import {AuthContext} from '../../provider/Context'
import useLogin from '@pn/utils/Login'
import Portalnesia from '@portalnesia/react-native-core'
import useForceUpdate from '@pn/utils/useFoceUpdate'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'
import {useSelector,changeLang,changeTheme,useDispatch} from '@pn/provider/actions'
import verifyApps from '@pn/utils/VerifyApps'

LogBox.ignoreLogs(['Setting a timer for a long period of time']);

Notifications.setNotificationHandler({
    handleNotification: async()=>({
        shouldShowAlert:true,
        shouldPlaySound:true,
        shouldSetBadge:true
    })
})

const AuthProviderFunc = (props) => {
	const dropdownRef=useRef(null)
	const currentInternet=useRef(true);
	const colorScheme = useColorScheme()
	const forceUpdate = useForceUpdate();
	const {navigationRef} = useRootNavigation()
	const dispatch = useDispatch();
	const context = useSelector(type=>({theme:type.theme,userTheme:type.userTheme,lang:type.lang,user:type.user}));

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

	const {refreshToken} = useLogin({setNotif})

	useEffect(()=>{
		async function asyncTask(){
			try {
				await verifyApps();
				let [res,lang,ads] = await Promise.all([AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang"),AsyncStorage.getItem("ads")])

				if(res !== null) {
					const theme=(colorScheme==='dark' && res === 'auto' || res === 'dark') ? "dark" : "light";
					dispatch(changeTheme(theme,(res)));
				} else {
					const theme=(colorScheme==='dark') ? "dark" : "light";
					dispatch(changeTheme(theme,'auto'));
				}
				if(lang !== null) {
					dispatch(changeLang((lang)));
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
			} catch(err){
				console.log("Init Err",err);
				dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
				return;
			}
		};

		const netInfoListener = NetInfo.addEventListener(state=>{
			if(state.isInternetReachable && !currentInternet.current) {
				setNotif(false,i18n.t('net_online'));
				currentInternet.current=true;
			} else if(!state.isInternetReachable && currentInternet.current) {
				setNotif(true,i18n.t('net_offline'));
				currentInternet.current=false;
			}
		})

		asyncTask();
		
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
			if(['id','en'].indexOf(context.lang) !== -1) {
				const lng = context.lang === 'id' ? "id-ID" : "en-US";
				i18n.locale =lng;
			} else {
				i18n.locale = Portalnesia.Core.getLocales()[0].languageTag;
			}
			forceUpdate();
		}

		onLocalizationChange();
		Portalnesia.Core.addEventListener('localizationChange',onLocalizationChange)

		return ()=>{
			Portalnesia.Core.removeEventListener('localizationChange',onLocalizationChange)
		}
	},[context.lang])

	return (
		<AuthContext.Provider
			value={{
				setNotif,
				sendReport,
			}}
		>
			<IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
			<ApplicationProvider {...eva} theme={{...eva[context.theme],...theme[context.theme]}} customMapping={mapping}>
				<PortalProvider>
					{props.children}
				</PortalProvider>
				<DropdownAlert
					successColor='#2f6f4e'
					activeStatusBarStyle='light-content'
					inactiveStatusBarStyle={context.theme==='light' ? "dark-content" : "light-content"}
					inactiveStatusBarBackgroundColor={context.theme==='light' ? "#FFFFFF" : "#222B45"}
					renderImage={()=>null}
					ref={dropdownRef} />
			</ApplicationProvider>
		</AuthContext.Provider>
	);
};

const AuthProvider = React.memo(AuthProviderFunc)

export { AuthContext, AuthProvider };
