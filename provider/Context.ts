import {createContext,Dispatch} from 'react'
import {UserType,TokenType} from '@pn/types/index'

export type StateType = {
    user: UserType | null,
	token:null,
	session:null
}

export type DispatchArgument = {
    type: 'LOGIN'|'LOGOUT'|'MANUAL',
    payload?: string|{[key: string]: any}
}

export type ContextType = {
    state: StateType,
    dispatch: Dispatch<DispatchArgument>,
    setNotif:(type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data?: {[key: string]: any})=>void,
    setTheme:(value: 'light' | 'auto' | 'dark')=>Promise<void>,
    theme: 'light' | 'dark' | string,
    userTheme: 'light' | 'auto' | 'dark' | string,
    setLang:(value: 'light' | 'auto' | 'dark')=>Promise<void>,
    lang: string
}

const defaultValue = {
    state:{
        user:null,
        token:null,
        session:null
    },
    dispatch:()=>{},
    setNotif:()=>{},
    setTheme:async()=>{},
    theme:'light',
    userTheme:'auto',
    setLang:async()=>{},
    lang:'auto'
}

export const AuthContext = createContext<ContextType>(defaultValue);