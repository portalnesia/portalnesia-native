import React from 'react'
import {Alert} from 'react-native'
import {maybeCompleteAuthSession} from 'expo-web-browser'
import {loadAsync,AuthRequest,AccessTokenRequestConfig,AuthRequestConfig, exchangeCodeAsync,RefreshTokenRequestConfig,refreshAsync, TokenResponse,revokeAsync,RevokeTokenRequestConfig,TokenTypeHint} from 'expo-auth-session'
import {createURL} from 'expo-linking'
import * as Secure from 'expo-secure-store'
import * as Application from 'expo-application'

import {API as APIaxios} from '@pn/utils/API'
import {CLIENT_ID,API} from '@env'
import {DispatchArgument, StateType} from '@pn/provider/Context'

maybeCompleteAuthSession();

const discovery = {
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

export default function useLogin({dispatch,state,setNotif}: UseLoginOptions) {
    async function login() {
        try {
            if(state.user === false) {
                const data = await login_in();
                if(data !== false) {
                    //console.log(data);
                    const profile = await getProfile(data)
                    if(typeof profile !== 'string') {
                        await Promise.all([
                            Secure.setItemAsync('token',JSON.stringify(data)),
                            Secure.setItemAsync('user',JSON.stringify(profile))
                        ])
                        if(typeof dispatch === 'function') dispatch({type:"LOGIN",payload:{user:profile,token:data,session:profile?.session_id}})
                        setNotif(false,"Logged in",`Welcome back, ${profile?.username}`);
                        return true;
                    } else {
                        setNotif(true,"Error",profile);
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } catch(e) {
            console.log(e)
            return true;
        }
        
    }

    async function logout() {
        if(state.user !== false && state.user !== null) {
            const token_string = await Secure.getItemAsync('token');
            if(token_string !== null) {
                const token: TokenResponse = JSON.parse(token_string);
                await Promise.all([
                    revokeToken(token),
                    Secure.deleteItemAsync('user'),
                    Secure.deleteItemAsync('token')
                ])
                if(typeof dispatch === 'function') dispatch({type:"LOGOUT"})
                setNotif(false,"You've successfully logged out.")
            }
        }
        return;
    }

    async function refreshToken() {
        const token_string = await Secure.getItemAsync('token');
        if(token_string!==null) {
            let token: TokenResponse = JSON.parse(token_string);
            const date_now = Number((new Date().getTime()/1000).toFixed(0));
            if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
                token = await refreshingToken(token);
                if(token) {
                    const user = await getProfile(token);
                    await Promise.all([
                        Secure.setItemAsync('token',JSON.stringify(token)),
                        ...(typeof user !== 'string' ? [Secure.setItemAsync('user',JSON.stringify(user))] : [])
                    ])
                    if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token,...(typeof user !== 'string' ? {user,session:user?.session_id} : {})}})
                }
            } else {
                const user = await getProfile(token);
                if(typeof user !== 'string') {
                    await Secure.setItemAsync('user',JSON.stringify(user))
                }
                if(typeof dispatch === 'function') dispatch({type:"MANUAL",payload:{token,...(typeof user !== 'string' ? {user,session:user?.session_id} : {})}})
            }
        } else {
            await Promise.all([
                Secure.deleteItemAsync('user'),
                Secure.deleteItemAsync('token')
            ])
            if(typeof dispatch === 'function') dispatch({ type:"MANUAL",payload:{user:false,token:null,session:Application.androidId}})
        }
        return;
    }

    return {login,logout,refreshToken}
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

async function login_in(){
    const config: AuthRequestConfig = {
        clientId:CLIENT_ID,
        redirectUri: createURL('login-callback'),
        scopes:['basic','email'],
        usePKCE:true
    }
    const request = await loadAsync(config,discovery);
    const result = await request.promptAsync(discovery);
    if(result?.type === 'error') {
        const {error,error_description} = result?.params;
        Alert.alert(
            error,
            error_description,
            [
                {
                    text:"OK",
                    onPress:()=>{}
                }
            ]
        )
    } else if(result?.type === 'success') {
        const token = await exchangeToken(result.params.code,request)
        return token;
    }
    return false;
}

async function exchangeToken(code: string,request: AuthRequest){
    const config: AccessTokenRequestConfig = {
        clientId:CLIENT_ID,
        code:code,
        extraParams:{
            code_verifier:request.codeVerifier||'',
            device_id:(Application.androidId === null ? "" : Application.androidId)
        },
        redirectUri: createURL('login-callback'),
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