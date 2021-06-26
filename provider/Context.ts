import {createContext,Dispatch} from 'react'
import {UserType} from '@pn/types/index'

export type StateType = {
    user: UserType | null,
	token:string|null,
	session:string|null
}

export type DispatchArgument = {
    type: 'LOGIN'|'LOGOUT'|'MANUAL',
    payload?: string|{[key: string]: any}
}

export interface ParamsReportType {
    endpoint?: string|null|number,
    urlreported?: string,
    force?: boolean,
    contentTitle?: string,
    contentId?: string|number,
    contentType?: string
    [key: string]: any
}

export type SendReportType = 'komentar'|'url'|'konten'|'feedback'

export type ContextType = {
    state: StateType,
    dispatch: Dispatch<DispatchArgument>,
    setNotif:(type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data?: {[key: string]: any})=>void,
    setTheme:(value: 'light' | 'auto' | 'dark')=>Promise<void>,
    theme: 'light' | 'dark' | string,
    userTheme: 'light' | 'auto' | 'dark' | string,
    setLang:(value: 'light' | 'auto' | 'dark')=>Promise<void>,
    lang: string,
    isLogin:boolean,
    sendReport:(type: SendReportType,params?: ParamsReportType)=>void
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
    lang:'auto',
    isLogin:false,
    sendReport:()=>{}
}

export const AuthContext = createContext<ContextType>(defaultValue);