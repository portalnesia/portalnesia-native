import React from 'react'
import axios from 'axios'
import {API as APII,CLIENT_ID} from '@env'
import { AuthContext } from '@pn/provider/Context';
import {Constants} from 'react-native-unimodules'
import * as Application from 'expo-application'
import i18n from 'i18n-js'
import {GraphQLClient} from 'graphql-request'

export const API = axios.create({
    baseURL:APII,
    timeout:10000,
    headers: {
        'X-Application-Version': Constants.nativeAppVersion,
        'X-Device-Id': Application.androidId,
        'X-Session-Id':Application.androidId
    }
})

//let tokens=null;

export const fetcher=(path,option) => {
    return new Promise((resolve,reject)=>{
        API.get(path,option)
        .then(res=>{
            return new Promise((resol,reje)=>{
                const data = res.data;
                if(data?.error) reje({message:data?.msg||i18n.t('errors.general'),...data});
                else resol(data);
            })
        })
        .then(resolve)
        .catch(err=>{
            reject(err)
        });
    })
}

/*export const setToken=token=>{
    tokens=token
    API.interceptors.request.use(function(config){
        if(token===null) {
            if(config.headers.Authorization) delete config.headers.Authorization;
        } else {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })
}*/

export default function useAPI(){
    const context = React.useContext(AuthContext)
    const {setNotif,state,sendReport} = context
    const {user,session,token}=state
    
    const PNpost=(url,data,formdata,catchError=true)=>{
        return new Promise((res,rej)=>{
            const baseURL =  user === false || user === null ?  `/native${url}` :  `/native_secure${url}`
            const qs=require('qs');
            const dt=data===null ? "" : (formdata ? data : qs.stringify(data));
            let opt={}
            if(formdata) {
                const {headers:otherHeader,...other}=formdata;
                opt={
                    headers:{
                        'X-Session-Id':session,
                        ...(user === false || user === null ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                        ...otherHeader
                    },
                    ...other
                }
                //opt.headers['Content-Type']="multipart/form-data";
            } else {
                opt={
                    headers:{
                        'X-Session-Id':(state?.session !== null ? state?.session : Application.androidId),
                        ...(user === false || user === null ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                    },
                }
            }
            API.post(baseURL,dt,opt)
            .then((response)=>{
                if(response?.data?.error == 1 && catchError) {
                    //console.log(response?.status)
                    setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : i18n.t('errors.general'));
                }
                res(response?.data);
            })
            .catch((err)=>{
                if(catchError) {
                    if(err?.response?.data) {
                        setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg :i18n.t('errors.general'));
                    }
                    else if(err?.response?.status===503||err?.response?.status===500) {
                        sendReport('url',{force:false,endpoint:baseURL})
                    } else {
                        setNotif("error","Error",i18n.t('errors.general'))
                    }
                }
                
                rej(err);
            })
        })
    }

    const PNget=(url,catchError=true)=>{
        return new Promise((res,rej)=>{
            const baseURL =  user === false || user === null ?  `/native${url}` :  `/native_secure${url}`
            const opt={
                headers:{
                    'X-Session-Id':(session !== null ? session : Application.androidId),
                    ...(user === false || user === null ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                },
            }
            console.log(session);
            API.get(baseURL,opt)
            .then((response)=>{
                if(response?.data?.error == 1 && catchError) {
                    setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : "Something went wrong");
                }
                res(response?.data);
            })
            .catch((err)=>{
                //console.log(`PNGET: ${url}`,err?.response?.data,opt)
                if(catchError) {
                    if(err?.response?.data) {
                        setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg : "Something went wrong");
                    }
                    else if(err?.response?.status===503) {
                        setNotif("error","Error",i18n.t('errors.server'));
                    } else {
                        setNotif("error","Error",i18n.t('errors.general'))
                    }
                }
                rej(err);
            })
        })
    }

    const fetcher=(path) => {
        return new Promise((resolve,reject)=>{
            const baseURL =  user !== false ? `/native_secure${path}` : `/native${path}`
            const opt={
                headers:{
                    'X-Session-Id':state?.session,
                    ...(user === false || user === null ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
                },
            }
            API.get(baseURL,opt)
            .then(res=>{
                return new Promise((resol,reje)=>{
                    const data = res.data;
                    if(data?.error) resol({message:data?.msg||i18n.t('errors.general'),...data});
                    else resol(data);
                })
            })
            .then(resolve)
            .catch(err=>{
                if(err?.response?.data) resolve(err?.response?.data)
                else reject(err)
            });
        })
    }

    const PNgraph=(url,query)=>{
        return new Promise((result,rej)=>{
            const baseURL =  user !== false ? `${APII}/native_secure${url}` : `${APII}/native${url}`
            const headers={
                'X-Application-Version': Constants.nativeAppVersion,
                'X-Device-Id': Application.androidId,
                'X-Session-Id':state?.session,
                ...(user === false || user === null ? {} : {'Authorization':`Bearer ${token.accessToken}`,'PN-Client-Id':CLIENT_ID}),
            };
            const graphQL=new GraphQLClient(baseURL,{
                headers
            })
            graphQL.request(query).then((res)=>{
                if(res?.error && res?.error==1) {
                    //console.log("GRAPH_RES1",res);
                    rej({message:res?.msg||"Something went wrong"})
                }
                else if(res?.errors && res?.errors?.[0]?.message) {
                    //console.log("GRAPH_RES2",res);
                    rej({message:res?.errors?.[0]?.message})
                }
                else {
                    result(res);
                }
            }).catch((err)=>{
                rej(err)
            })
        })
    }

    return {PNpost,PNget,fetcher,PNgraph}
}