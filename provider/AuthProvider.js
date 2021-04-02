import React, { createContext, useRef, useEffect, useReducer,useMemo } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
import * as Applications from 'expo-application'
import axios from 'axios'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {getDevicePushTokenAsync} from 'expo-notifications'
import {Constants} from 'react-native-unimodules'
import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
import {API as APII} from '@env'

const API = axios.create({
    baseURL:APII,
    timeout:10000,
    headers: {
        'X-Application-Version': Constants.nativeAppVersion,
        'X-Device-Id': Applications.androidId,
		'X-Session-Id':Applications.androidId
    }
})
const AuthContext = createContext();

const reducer=(prevState,action)=>{
	switch(action?.type){
		case "LOGIN":
			return {
				...prevState,
				user:action.payload.user,
				token:action.payload.token
			}
		case "LOGOUT":
			return {...prevState,user:false,token:null}
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
	const [state,dispatch]=useReducer(reducer,initialState)
	const colorScheme = useColorScheme()
	const [tema,setTema]=React.useState('auto')

	const utils=useMemo(
		()=>({
			login: async data=>{

			},
			logout: async()=>{

			}
		}),
		[]
	)

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
				setNotif(true,"Error","Something went wrong")
			}
		}
	}

	const setNotif=(type,title,msg)=>{
		let tipe=type;
		if(typeof type === 'boolean') {
			tipe = type===true ? 'error' : 'success'
		}
		dropdownRef.current.alertWithType(tipe||'success',title||"Title",msg,{type:'alert'});
	}

	useEffect(()=>{
		(async function(){
			const res = await AsyncStorage.getItem("theme")
			if(res !== null) setTema(res);
			const notif_token = (await getDevicePushTokenAsync()).data
			API.post('/native/send_notification_token',`token=${notif_token}`)
			dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Applications.androidId}})
		})();
		
	},[])

	return (
		<AuthContext.Provider
			value={{
				state,
				dispatch,
				utils,
				setNotif,
				setTheme,
				theme:selectedTheme,
				userTheme:tema
			}}
		>
			<IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
			<ApplicationProvider {...eva} theme={{...eva[selectedTheme],...theme[selectedTheme]}} customMapping={mapping}>
				{props.children}
				<DropdownAlert
					successColor='#2f6f4e'
					activeStatusBarStyle='light-content'
					inactiveStatusBarStyle={selectedTheme==='light' ? "dark-content" : "light-content"}
					inactiveStatusBarBackgroundColor={selectedTheme==='light' ? "#FFFFFF" : "#222B45"}
					onTap={(data)=>console.log(data)}
					renderImage={()=>null}
					ref={dropdownRef} />
			</ApplicationProvider>
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
