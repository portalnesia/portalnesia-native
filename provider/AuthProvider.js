import React, { createContext, useRef, useEffect, useReducer,useMemo } from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import DropdownAlert from 'react-native-dropdownalert'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
//import {useColorScheme} from 'react-native-appearance'
import {useColorScheme} from 'react-native'
import {setStatusBarStyle,setStatusBarBackgroundColor} from 'expo-status-bar'

import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
//import colors from 'constants/colors';
//import * as firebase from 'firebase';
const AuthContext = createContext();

const reducer=(prevState,action)=>{
	switch(action.type){
		case "LOGIN":
			return {
				...prevState,
				user:action.payload.user,
				token:action.payload.token
			}
		case "LOGOUT":{
			return {
				...prevState,
				user:false,
				token:null
			}
		}
		default:
			return {...prevState}
	}
}

const initialState={
	user:null,
	token:null
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

	const setTheme=(val)=>{
		if(['light','auto','dark'].indexOf(val)) setTema(val);
	}

	const setNotif=(type,title,msg)=>{
		let tipe=type;
		if(typeof type === 'boolean') {
			tipe = type===true ? 'error' : 'success'
		}
		dropdownRef.current.alertWithType(tipe||'success',title||"Title",msg,{type:'alert'});
	}

	useEffect(()=>{
		dispatch({type:"LOGOUT"})
	},[])
	

	return (
		<AuthContext.Provider
			value={{
				state,
				dispatch,
				utils,
				setNotif,
				setTheme,
				theme:selectedTheme
			}}
		>
			<IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
			<ApplicationProvider {...eva} theme={{...eva[selectedTheme],...theme[selectedTheme]}} customMapping={mapping}>
				{props.children}
				<DropdownAlert
					tapToCloseEnabled={false}
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
