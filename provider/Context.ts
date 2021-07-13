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
    setNotif:(type: boolean | 'error' | 'success' | 'info',title: string,msg?: string,data?: {[key: string]: any})=>void,
    setTheme:(value: 'light' | 'auto' | 'dark')=>Promise<void>,
    setLang:(value: 'auto'|'en'|'id')=>Promise<void>,
    sendReport:(type: SendReportType,params?: ParamsReportType)=>void
}

const defaultValue = {
    setNotif:()=>{},
    setTheme:async()=>{},
    setLang:async()=>{},
    sendReport:()=>{}
}

export const AuthContext = createContext<ContextType>(defaultValue);