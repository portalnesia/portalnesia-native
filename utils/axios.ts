import {API as APII} from '@env'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import * as Application from 'expo-application'
import {Constants} from 'react-native-unimodules'
import perf,{FirebasePerformanceTypes} from '@react-native-firebase/perf'

const API = axios.create({
    baseURL:APII,
    timeout:10000,
    headers: {
        'X-Application-Version': Constants.nativeAppVersion,
        'X-Device-Id': Application.androidId,
        'X-Session-Id':Application.androidId
    }
})

interface CustomRequestConfig extends AxiosRequestConfig {
    metadata?: {
        httpMetric: FirebasePerformanceTypes.HttpMetric
    }
}

async function requestAxios(config: AxiosRequestConfig){
    const new_config:CustomRequestConfig = config;
    try {
        const method = (new_config.method as FirebasePerformanceTypes.HttpMethod)
        const httpMetric = perf().newHttpMetric(new_config.url,method);
        new_config.metadata = { httpMetric }

        await httpMetric.start();
    } finally {
        return new_config;
    }
}

interface CustomResponse extends AxiosResponse<any> {
    config: CustomRequestConfig
}

async function responseAxios(response: AxiosResponse<any>) {
    const new_response:CustomResponse = response;
    try {
        const {httpMetric} = new_response.config.metadata;
        httpMetric.setHttpResponseCode(new_response.status);
        httpMetric.setResponseContentType(new_response.headers['content-type']);
        await httpMetric.stop();
    } finally {
        return new_response;
    }
}
async function errorAxios(e:any){
    try {
        const {httpMetric} = e?.config?.metadata;
        httpMetric.setHttpResponseCode(e?.reponse?.status);
        httpMetric.setResponseContentType(e?.reponse?.headers['content-type']);
        await httpMetric.stop();
    } finally {
        return Promise.reject(e);
    }
}

API.interceptors.request.use(requestAxios)
API.interceptors.response.use(responseAxios,errorAxios);

export default API;