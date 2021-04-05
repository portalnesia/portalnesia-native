import React from 'react'
import axios from 'axios'
import {API as APII,API_URL,API_URL_2} from '@env'
import { AuthContext } from '@pn/provider/AuthProvider';
import {Constants} from 'react-native-unimodules'
import * as Application from 'expo-application'

export const API = axios.create({
    baseURL:APII,
    timeout:10000,
    headers: {
        'X-Application-Version': Constants.nativeAppVersion,
        'X-Device-Id': Application.androidId
    }
})
let tokens=null;

export const fetcher=(url) => fetch(url, {...(tokens!==null ? {headers:{Authorization:`Bearer ${tokens}`},'X-Application-Version': Constants.nativeAppVersion,'X-Device-Id': Application.androidId,credentials: 'include'} : {headers:{'X-Application-Version': Constants.nativeAppVersion,'X-Device-Id': Application.androidId}})}).then(res=>res.json());

export const setToken=token=>{
    tokens=token
    API.interceptors.request.use(function(config){
        if(token===null) {
            if(config.headers.Authorization) delete config.headers.Authorization;
        } else {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })
}

export default function useAPI(){
    const context = React.useContext(AuthContext)
    const {setNotif,state} = context
    const {user,session,token}=state
    
    const PNpost=(url,data,formdata)=>{
        return new Promise((res,rej)=>{
            const baseURL =  user === false || user === null ?  `/native${url}` :  url
            const qs=require('qs');
            const dt=data===null ? "" : (formdata ? data : qs.stringify(data));
            let opt={}
            if(formdata) {
                const {headers:otherHeader,...other}=formdata;
                opt={
                    headers:{
                        'X-Session-Id':session,
                        ...otherHeader
                    },
                    ...other
                }
                //opt.headers['Content-Type']="multipart/form-data";
            } else {
                opt={
                    headers:{
                        'X-Session-Id':(state?.session !== null ? state?.session : Application.androidId) 
                    },
                }
            }
            API.post(baseURL,dt,opt)
            .then((response)=>{
                if(response?.data?.error == 1) {
                    //console.log(response?.status)
                    setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : "Something went wrong");
                }
                res(response?.data);
            })
            .catch((err)=>{
                //console.log(err?.response)
                if(err?.response?.data) {
                    setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg : "Something went wrong");
                }
                else if(err?.response?.status===503) {
                    setNotif("error","Error","Internal Server Error");
                    //dispatch({type:'REPORT',payload:{type:'url',urlreported:window?.location?.href,endpoint:url}})
                } else {
                    setNotif("error","Error","Something went wrong")
                }
                rej();
            })
        })
    }

    const PNget=(url)=>{
        return new Promise((res,rej)=>{
            const baseURL =  user === false || user === null ?  `/native${url}` :  url
            const opt={
                headers:{
                    'X-Session-Id':(state?.session !== null ? state?.session : Application.androidId) 
                },
            }
            API.get(baseURL,opt)
            .then((response)=>{
                if(response?.data?.error == 1) {
                    console.log(response?.status)
                    setNotif("error","Error",typeof response?.data?.msg=== 'string' ? response?.data?.msg : "Something went wrong");
                }
                res(response?.data);
            })
            .catch((err)=>{
                if(err?.response?.data) {
                    setNotif("error","Error",typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg : "Something went wrong");
                }
                else if(err?.response?.status===503) {
                    setNotif("error","Error","Internal Server Error");
                    //dispatch({type:'REPORT',payload:{type:'url',urlreported:window?.location?.href,endpoint:url}})
                } else {
                    setNotif("error","Error","Something went wrong")
                }
                rej();
            })
        })
    }

    const fetcher=(path) => {
        return new Promise((resolve,reject)=>{
            const baseURL =  user !== false ? path : `/native${path}`
            const opt={
                headers:{
                    'X-Session-Id':state?.session
                },
            }
            API.get(baseURL,opt)
            .then(res=>{
                return new Promise((resol,reje)=>{
                    const data = res.data;
                    if(data?.error) resol({message:data?.msg||"Something went wrong",...data});
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
    return {PNpost,PNget,fetcher}
}