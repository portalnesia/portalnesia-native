import React from 'react'
import {maybeCompleteAuthSession} from 'expo-web-browser'
import {AuthRequest,AccessTokenRequestConfig,AuthRequestConfig, exchangeCodeAsync,RefreshTokenRequestConfig,refreshAsync, TokenResponse,revokeAsync,RevokeTokenRequestConfig,TokenTypeHint} from 'expo-auth-session'
import {createURL} from 'expo-linking'
import * as Secure from 'expo-secure-store'
import * as Application from 'expo-application'
import * as Notifications from 'expo-notifications'
import {useDispatch,logout as actionLogout,login as actionLogin} from '@pn/provider/actions'

import APIaxios from './axios'
import {CLIENT_ID,API} from '@env'
import {DispatchArgument} from '@pn/provider/Context'
import Authentication, { AccountManagerType } from '@pn/module/Authentication'
import { log, logError } from './log'

maybeCompleteAuthSession();

type ResponseToken = {
    accessToken: string,
    refreshToken?: string
}

const getNotifOption=(id: string,desc?:string): Notifications.NotificationChannelInput=>({
	name:id,
    description:desc,
	importance:Notifications.AndroidImportance.HIGH,
	lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC,
	sound:'default',
	vibrationPattern:[250],
	enableVibrate:true
})

export const discovery = {
    authorizationEndpoint:`${API}/v2/oauth/authorize`,
    tokenEndpoint:`${API}/v2/oauth/token`,
    revocationEndpoint:`${API}/v2/oauth/revoke`
}

export async function getProfile(token: ResponseToken){
    let data;
    try {
        const result = await APIaxios.get('/v2/me',{headers:{'PN-Client-Id':CLIENT_ID,'Authorization':`Bearer ${token.accessToken}`}})
        if(result?.data?.result) {
            data = result.data.result;

        } else {
            data = result?.data?.error_description||"Something went wrong"
        }
    } catch(e: any){
        log("getProfile Login.ts error",{msg:e.message});
        logError(e,"getProfile Login.ts");
        data = "Something went wrong";
    }
    return data;
}

type UseLoginOptions = (type: boolean | "error" | "success" | "info", title: string, msg?: string | undefined, data?: {[key: string]: any}) => void

export async function notificationInit(type:'login'|'logout') {
    if(type==='login') {
        await Promise.all([
            Notifications.setNotificationChannelAsync("Security", getNotifOption("Security","Notifications about security updates for your account or your application")),
            Notifications.setNotificationChannelAsync("Birthday", getNotifOption("Birthday","Notifications for the birthdays of someone you are following")),
            Notifications.setNotificationChannelAsync("Comments", getNotifOption("Comments","Notifications for comments, including someone commenting on your content or someone replying to your comment")),
            Notifications.setNotificationChannelAsync("Messages", getNotifOption("Messages","Notifications for the new messages for you"))
        ])
    } else {
        await Promise.all([
            Notifications.deleteNotificationChannelAsync("Security"),
            Notifications.deleteNotificationChannelAsync("Birthday"),
            Notifications.deleteNotificationChannelAsync("Comments"),
            Notifications.deleteNotificationChannelAsync("Messages")
        ])
    }
}

export async function loginInit(data: TokenResponse,profile: any) {
    await Promise.all([
        Secure.setItemAsync('token',JSON.stringify(data)),
        Secure.setItemAsync('user',JSON.stringify(profile)),
        notificationInit('login')
    ])
    return;
}

export async function logoutInit() {
    await Promise.all([
        Secure.deleteItemAsync('user'),
        Secure.deleteItemAsync('token'),
        Secure.deleteItemAsync('lock_fingerprint'),
        notificationInit('logout')
    ])
    return;
}

export default function useLogin(setNotif?: UseLoginOptions) {
    const dispatch=useDispatch();
    const logout=React.useCallback(async(tkn?: ResponseToken,notify?:{type: boolean | "error" | "success" | "info", title: string, msg?: string | undefined})=>{
        let token: ResponseToken|undefined;
        if(!tkn) {
            const token_string = await Secure.getItemAsync('token');
            if(token_string !== null) {
                token = JSON.parse(token_string);
            }
        } else {
            token = tkn;
        }
        let account: AccountManagerType|undefined;
        try {
            const accounts = await Authentication.getAccounts();
            account = accounts[0];
        } catch(e: any){
            log("logout getAccounts Login.ts error",{msg:e.message});
            logError(e,"logout getAccounts Login.ts");
        }
        if(token) {
            try {
                await Promise.all([
                    revokeToken(token),
                    logoutInit(),
                    Secure.deleteItemAsync("token"),
                    Secure.deleteItemAsync("user"),
                    [...(account?.name ? [Authentication.removeAccount(account)] : [])]
                ])
                dispatch(actionLogout())
                if(typeof setNotif==='function') setNotif(notify?.type||false,notify?.title||"Sucess",notify?.msg||"You've successfully logged out.")
            } catch(e: any) {
                log("logout Login.ts error",{msg:e.message});
                logError(e,"logout Login.ts");
                await Promise.all([
                    logoutInit(),
                    Secure.deleteItemAsync("token"),
                    Secure.deleteItemAsync("user"),
                    [...(account?.name ? [Authentication.removeAccount(account)] : [])]
                ])
                dispatch(actionLogout())
            }
        } else {
            await Promise.all([
                logoutInit(),
                Secure.deleteItemAsync("token"),
                Secure.deleteItemAsync("user"),
                [...(account?.name ? [Authentication.removeAccount(account)] : [])]
            ])
            dispatch(actionLogout())
        }
        return Promise.resolve();
    },[dispatch,setNotif])

    const refreshTokenUtils=React.useCallback(async(token: ResponseToken,account: AccountManagerType,fetchNewRefreshToken=true)=>{
        let new_token:ResponseToken;
        if(fetchNewRefreshToken && token?.refreshToken) {
            new_token = await refreshingToken(token);
            await Secure.setItemAsync("token",JSON.stringify(new_token));
        } else {
            new_token = token;
        }
        const user_string = await Secure.getItemAsync('user');
        if(user_string !== null) {
            const old_user = JSON.parse(user_string);
            dispatch(actionLogin({token:(new_token as TokenResponse),user:old_user,session:old_user?.session_id}))
            //dispatch({type:"MANUAL",payload:{token:new_token,user:old_user,session:old_user?.session_id}})
        } else {
            throw Error("Internal server error. Please login again")
        }
        
        return Promise.resolve();
    },[dispatch,logout])

    const refreshToken=React.useCallback(async()=>{
        const token_string = await Secure.getItemAsync('token');
        const token: TokenResponse|null = token_string===null ? null : JSON.parse(token_string);
        const accounts = await Authentication.getAccounts();
        let account = accounts[0];
        try {
            if(account?.name) {
                //const refresh_token = await Authentication.getPassword(account);
                // If js token == native token;  && token?.refreshToken == refresh_token
                if(token!==null) {
                    const date_now = Number((new Date().getTime()/1000).toFixed(0));
                    try {
                        // Check if token expired;
                        if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
                            await refreshTokenUtils(token,account);
                        }
                        // Token not expired
                        else {
                            await refreshTokenUtils(token,account,false);
                        }
                    } catch(e: any) {
                        logError(e,"refreshToken Login.ts");
                        logout(token);
                    }
                }
                // JS token != native token;
                else {
                    logout();
                }
            } 
            // Account manager empty
            else {
                logout(token !== null ? token: undefined);
            }
        } catch(e: any) {
            log("refreshToken Login.ts error",{msg:e.message});
            logError(e,"refreshToken Login.ts");
            logout(token !== null ? token: undefined);
        }
        return Promise.resolve();
    },[logout,dispatch,refreshTokenUtils])

    return {logout,refreshToken}
}

export async function refreshToken() {
    const token_string = await Secure.getItemAsync('token');
    if(token_string!==null) {
        const token: TokenResponse = JSON.parse(token_string);
        const date_now = Number((new Date().getTime()/1000).toFixed(0));
        if((date_now - token.issuedAt) > (token.expiresIn||3600 - 1000)) {
            const data = await refreshingToken(token);
            if(data) {
                await  Secure.setItemAsync('token',JSON.stringify(data))
                return data;
            } else return null;
        } else return token;
    } else return null;
}

export const loginRedirect = createURL("login-callback");

export const loginConfig: AuthRequestConfig = {
    clientId:CLIENT_ID,
    redirectUri: loginRedirect,
    scopes:['basic','email'],
    usePKCE:true
}

export async function exchangeToken(code: string,request: AuthRequest|{codeVerifier:string}){
    const config: AccessTokenRequestConfig = {
        clientId:CLIENT_ID,
        code:code,
        extraParams:{
            code_verifier:request.codeVerifier||'',
            device_id:(Application.androidId === null ? "" : Application.androidId)
        },
        redirectUri: loginRedirect,
    }
    const result = await exchangeCodeAsync(config,discovery);
    return result;
}

export async function refreshingToken(token: ResponseToken) {
    const config: RefreshTokenRequestConfig = {
        clientId:CLIENT_ID,
        refreshToken: token.refreshToken,
        scopes:['basic','email'],
        extraParams:{
            device_id:(Application.androidId === null ? "" : Application.androidId)
        }
    }
    const result = await refreshAsync(config,discovery);
    return result;
}

async function revokeToken(token: ResponseToken){
    const refreshCconfig: RevokeTokenRequestConfig = {
        clientId:CLIENT_ID,
        scopes:['basic','email'],
        extraParams:{
            device_id:(Application.androidId === null ? "" : Application.androidId)
        },
        token:token.refreshToken||token.accessToken,
        tokenTypeHint: (token.refreshToken ? TokenTypeHint.RefreshToken : TokenTypeHint.AccessToken)
    }
    await revokeAsync(refreshCconfig,discovery);
    if(token.refreshToken !== undefined) {
        const accessConfig: RevokeTokenRequestConfig = {
            clientId:CLIENT_ID,
            scopes:['basic','email'],
            extraParams:{
                device_id:(Application.androidId === null ? "" : Application.androidId)
            },
            token:token.accessToken,
            tokenTypeHint: TokenTypeHint.AccessToken
        }
        
        await revokeAsync(accessConfig,discovery);
    }
    return true;
}