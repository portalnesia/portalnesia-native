import axios,{AxiosRequestConfig} from 'axios'
import React from 'react'
import {API as APII,CLIENT_ID} from '@env'
import { AuthContext } from '@pn/provider/Context';
import {Constants} from 'react-native-unimodules'
import * as Application from 'expo-application'
import i18n from 'i18n-js'
import {GraphQLClient} from 'graphql-request'
import * as Secure from 'expo-secure-store'
import {refreshingToken} from '@pn/utils/Login'
import API from './axios'
import {TokenType} from '@pn/types/TokenTypes'
import {UserType} from '@pn/types/UserTypes'
import {TokenResponse} from 'expo-auth-session'
import { log, logError } from './log';

type ApiResponse<D> = {
    error:number,
    msg: string,
    [key: string]: any
} & D

export async function fetcher<D = any>(url: string,option?:AxiosRequestConfig): Promise<ApiResponse<D>> {
    const response = await API.get<ApiResponse<D>>(url,option);
    const data = response.data;
    if(Boolean(data?.error)) throw {message:data?.msg||i18n.t('errors.general'),...data};
    else return data;
}

async function getToken(){
    const token_string = await Secure.getItemAsync('token');
    const user_string = await Secure.getItemAsync('user');
    const result: {token: TokenResponse|null,session:string} = {token:null,session:(Application.androidId||"")};
    const token: TokenResponse|null = token_string===null ? null : JSON.parse(token_string);
    const user: UserType|null = user_string===null ? null : JSON.parse(user_string);
    result.session = user && user?.session_id ? user?.session_id : (Application.androidId||'');
    result.token = token;

    if(token!==null) {
        try {
            const date_now = Number((new Date().getTime()/1000).toFixed(0));
            if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
                const new_token = await refreshingToken(token);
                await Secure.setItemAsync('token',JSON.stringify(new_token));
                result.token = new_token;
            }
        } catch(e) {
            log("refreshToken API error",{msg:e.message});
            logError(e,"refreshToken API");
        }
    }
    
    return result;
}

async function refreshToken(token: TokenResponse){
    const new_token = await refreshingToken(token);
    await Secure.setItemAsync('token',JSON.stringify(new_token));
    return Promise.resolve();
}

export default function useAPI(){
    const context = React.useContext(AuthContext)
    const {setNotif,sendReport} = context

    const PNpost=React.useCallback(async<D = any>(url: string,data?:{[key: string]: any},formdata?: AxiosRequestConfig,catchError=true): Promise<ApiResponse<D>>=>{
        let token: TokenResponse|null=null,session:string="";
        try {
            const result = await getToken();
            token = result.token;
            session = result.session;
        } catch(e) {
            log("getToken error",{msg:e.message});
            logError(e,"getToken");
            setNotif(true,"Error",e.message);
            throw e;
        }
        const baseURL =  (token===undefined||token === null) ?  `/native${url}` :  `/native_secure${url}`
        const qs=require('qs');
        const dt=data===null ? "" : (formdata ? data : qs.stringify(data));
        let opt={}
        if(formdata) {
            const {headers:otherHeader,...other}=formdata;
            opt={
                headers:{
                    'X-Session-Id':session,
                    ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                    ...otherHeader
                },
                ...other
            }
            //opt.headers['Content-Type']="multipart/form-data";
        } else {
            opt={
                headers:{
                    'X-Session-Id':session,
                    ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                },
            }
        }
        try {
            const response = await API.post<ApiResponse<D>>(baseURL,dt,opt);
            if(response?.data?.error == 1 && catchError) {
                setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : i18n.t('errors.general'));
            }
            return response.data;
        } catch(err){
            if(err?.response?.status==440) {
                if(token!==undefined && token!==null) refreshToken(token);
                setNotif("error","Token expired","Please try again!");
            }
            else if(catchError) {
                if(err?.response?.data) {
                    setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg :i18n.t('errors.general'));
                }
                else if(err?.response?.status===503||err?.response?.status===500) {
                    sendReport('url',{force:false,endpoint:baseURL})
                } else {
                    setNotif("error","Error",err?.message||i18n.t('errors.general'))
                }
            }
            log("PNpost error",{msg:err.message});
            logError(err,"PNpost");
            console.log("API_ERROR",err?.response||err)
            throw err;
        }
    },[sendReport])

    const PNget=React.useCallback(async<D = any>(url: string,catchError=true): Promise<ApiResponse<D>>=>{
        let token: TokenResponse|null=null,session:string="";
        try {
            const result = await getToken();
            token = result.token;
            session = result.session;
        } catch(e) {
            log("getToken error",{msg:e.message});
            logError(e,"getToken");
            setNotif(true,"Error",e.message);
            throw e;
        }
        const baseURL = (token===undefined||token === null) ?  `/native${url}` :  `/native_secure${url}`
        const opt={
            headers:{
                'X-Session-Id':session,
                ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
            },
        }
        try {
            const response = await API.get<ApiResponse<D>>(baseURL,opt);
            if(response?.data?.error == 1 && catchError) {
                setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : "Something went wrong");
            }
            return response.data;
        } catch(err){
            if(err?.response?.status==440) {
                if(token!==undefined && token!==null) refreshToken(token);
                setNotif("error","Token expired","Please try again!");
            }
            else if(catchError) {
                if(err?.response?.data) {
                    setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg : "Something went wrong");
                }
                else if(err?.response?.status===503) {
                    setNotif("error","Error",i18n.t('errors.server'));
                } else {
                    setNotif("error","Error",i18n.t('errors.general'))
                }
            }
            log("PNget error",{msg:err.message});
            logError(err,"PNget");
            throw err;
        }
    },[])

    const fetcher=React.useCallback(async<D = any>(url: string): Promise<ApiResponse<D>>=>{
        let token: TokenResponse|null=null,session:string="";
        try {
            const result = await getToken();
            token = result.token;
            session = result.session;
        } catch(e) {
            log("getToken error",{msg:e.message});
            logError(e,"getToken");
            throw e;
        }
        const baseURL = (token===undefined||token === null) ?  `/native${url}` :  `/native_secure${url}`
        const opt={
            headers:{
                'X-Session-Id':session,
                ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
            },
        }
        try {
            const response = await API.get<ApiResponse<D>>(baseURL,opt);
            if(response?.data?.error) return {message:response?.data?.msg||i18n.t('errors.general'),...response?.data}
            else return response.data;
        } catch(err){
            if(err?.response?.status==440) {
                if(token!==undefined && token!==null) refreshToken(token);
                setNotif("error","Token expired","Please try again!");
            }
            log("fetcher error",{msg:err.message});
            logError(err,"fetcher");
            if(err?.response?.data) return err?.response?.data
            else throw err;
        }
    },[])

    const PNgraph=React.useCallback(async<D = any>(url:string,query:string): Promise<ApiResponse<D>>=>{
        let token: TokenResponse|null=null,session:string="";
        try {
            const result = await getToken();
            token = result.token;
            session = result.session;
        } catch(e) {
            log("getToken error",{msg:e.message});
            logError(e,"getToken");
            throw e;
        }
        const baseURL = (token===undefined||token === null) ?  `${APII}/native${url}` :  `${APII}/native_secure${url}`
        const headers={
            'X-Application-Version': Constants.nativeAppVersion||'',
            'X-Device-Id': Application.androidId||'',
            'X-Session-Id': session||'',
            ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
        };
        try {
            const graphQL=new GraphQLClient(baseURL,{
                headers
            })
            const res = await graphQL.request<ApiResponse<D>>(query);
            if(res?.error && res?.error==1) {
                throw {message:res?.msg||i18n.t('errors.general')}
            }
            else if(res?.errors && res?.errors?.[0]?.message) {
                throw {message:res?.errors?.[0]?.message}
            }
            return res;
        } catch(err){
            log("PNgraph error",{msg:err.message});
            logError(err,"PNgraph");
            throw err;
        }
    },[])

    const PNgetPkey=React.useCallback(async()=>{
        let token: TokenResponse|null=null,session:string="";
        try {
            const result = await getToken();
            token = result.token;
            session = result.session;
        } catch(e) {
            setNotif(true,"Error",e.message);
            log("getToken error",{msg:e.message});
            logError(e,"getToken");
            throw e;
        }
        const opt={
            headers:{
                'X-Session-Id':session,
                ...((token===undefined||token === null) ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
            },
        }
        try {
            const result=await API.get<ApiResponse<{}>>(`${APII}/v2/pkey`,opt);
            if(result?.data?.result) {
                return result.data.result;
            } else {
                throw {message:result?.data?.error_description||i18n.t('errors.general')}
            }
        } catch(err){
            log("PNgetPkey error",{msg:err.message});
            logError(err,"PNgetPkey");
            if(err?.response?.status==440) {
                if(token!==undefined && token!==null) refreshToken(token);
                setNotif("error","Token expired","Please try again!");
            } else {
                throw {message:i18n.t('errors.general')}
            }
        }
    },[])

    return {PNpost,PNget,fetcher,PNgraph,PNgetPkey}
}