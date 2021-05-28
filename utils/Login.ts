import React from 'react'
import {Alert} from 'react-native'
import {maybeCompleteAuthSession} from 'expo-web-browser'
import {loadAsync,AuthRequest,AccessTokenRequestConfig,AuthRequestConfig, exchangeCodeAsync,RefreshTokenRequestConfig,refreshAsync, TokenResponse,revokeAsync,RevokeTokenRequestConfig,TokenTypeHint} from 'expo-auth-session'
import {createURL} from 'expo-linking'
import * as Secure from 'expo-secure-store'
import * as Application from 'expo-application'
import * as Notifications from 'expo-notifications'

import {API as APIaxios} from '@pn/utils/API'
import {CLIENT_ID,API} from '@env'
import {DispatchArgument, StateType} from '@pn/provider/Context'

maybeCompleteAuthSession();

const getNotifOption=(id: string): Notifications.NotificationChannelInput=>({
	name:id,
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

export async function getProfile(token: TokenResponse){
    let data;
    try {
        const result = await APIaxios.get('/v2/me',{headers:{'PN-Client-Id':CLIENT_ID,'Authorization':`Bearer ${token.accessToken}`}})
        if(result?.data?.result) {
            data = result.data.result;

        } else {
            data = result?.data?.error_description||"Something went wrong"
        }
    } catch(e){
        //console.log(e?.request)
        data = "Something went wrong";
    }
    return data;
}

type UseLoginOptions = {
    dispatch: React.Dispatch<DispatchArgument>,
    state: StateType,
    setNotif:(type: boolean | "error" | "success" | "info", title: string, msg?: string | undefined, data?: {[key: string]: any} | undefined) => void
}

export async function loginInit(data: TokenResponse,profile: any) {
    await Promise.all([
        Secure.setItemAsync('token',JSON.stringify(data)),
        Secure.setItemAsync('user',JSON.stringify(profile)),
        Notifications.setNotificationChannelAsync("Security", getNotifOption("Security")),
        Notifications.setNotificationChannelAsync("Birthday", getNotifOption("Birthday")),
        Notifications.setNotificationChannelAsync("Comments", getNotifOption("Comments")),
        Notifications.setNotificationChannelAsync("Messages", getNotifOption("Messages")),
        Notifications.setNotificationChannelAsync("Features & Promotion", getNotifOption("Features & Promotion")),
    ])
    return;
}

export async function logoutInit() {
    await Promise.all([
        Secure.deleteItemAsync('user'),
        Secure.deleteItemAsync('token'),
        Notifications.deleteNotificationChannelAsync("Security"),
        Notifications.deleteNotificationChannelAsync("Birthday"),
        Notifications.deleteNotificationChannelAsync("Comments"),
        Notifications.deleteNotificationChannelAsync("Messages"),
        Notifications.deleteNotificationChannelAsync("Features & Promotion")
    ])
    return;
}

export default function useLogin({dispatch,state,setNotif}: UseLoginOptions) {
    async function logout(tkn?: TokenResponse,notify?:{type: boolean | "error" | "success" | "info", title: string, msg?: string | undefined}) {
        let token: TokenResponse|undefined;
        if(!tkn) {
            const token_string = await Secure.getItemAsync('token');
            if(token_string !== null) {
                token = JSON.parse(token_string);
            }
        } else {
            token = tkn;
        }

        if(token) {
            try {
                await Promise.all([
                    revokeToken(token),
                    logoutInit()
                ])
                if(typeof dispatch === 'function') dispatch({type:"LOGOUT"})
                setNotif(notify?.type||false,notify?.title||"Sucess",notify?.msg||"You've successfully logged out.")
            } catch(e) {
                await logoutInit();
                if(typeof dispatch === 'function') dispatch({type:"LOGOUT"})
            }
        } else {
            await logoutInit();
            if(typeof dispatch === 'function') dispatch({type:"LOGOUT"})
        }
        return;
    }

    async function refreshToken() {
        const token_string = await Secure.getItemAsync('token');
        // Check token storage
        if(token_string!==null) {
            const token: TokenResponse = JSON.parse(token_string);
            const date_now = Number((new Date().getTime()/1000).toFixed(0));
            // Check if token expired;
            if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
                // Refresh token if expired
                try {
                    const new_token = await refreshingToken(token);
                    if(new_token) {
                        const user = await getProfile(new_token);
                        // Try update user database
                        if(typeof user !== 'string') {
                            await Promise.all([
                                Secure.setItemAsync('token',JSON.stringify(new_token)),
                                Secure.setItemAsync('user',JSON.stringify(user))
                            ])
                            if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token:new_token,...(typeof user !== 'string' ? {user,session:user?.session_id} : {})}})
                        }
                        // Using old user database
                        else {
                            const user_string = await Secure.getItemAsync('user');
                            if(user_string !== null) {
                                const old_user = JSON.parse(user_string);
                                if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token:new_token,user:old_user,session:old_user?.session_id}})
                            } else {
                                await logout(new_token,{type:true,title:"Error",msg:`Internal server error\n. Please login again`});
                            }
                        }
                    }
                } catch(e) {
                    // Logout when failed to refresh token
                    await logout(token,{type:true,title:"Error",msg:`Internal server error.\nPlease login again`});
                }
            }
            // Using old token
            else {
                const user = await getProfile(token);
                // Try update user database with old token
                if(typeof user !== 'string') {
                    await Secure.setItemAsync('user',JSON.stringify(user))
                    if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token,user,session:user?.session_id}})
                }
                // Using old user database
                else {
                    const user_string = await Secure.getItemAsync('user');
                    if(user_string !== null) {
                        const old_user = JSON.parse(user_string);
                        if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token,user:old_user,session:old_user?.session_id}})
                    } else {
                        await logout(token,{type:true,title:"Error",msg:`Internal server error.\nPlease login again`});
                    }
                }
            }
        } else {
            await logout();
        }
        return;
    }

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

export async function refreshingToken(token: TokenResponse) {
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

async function revokeToken(token: TokenResponse){
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