import {AxiosRequestConfig,AxiosInstance} from 'axios'

export interface APIResponseTypes {
    PNpost:<R = any>(url: string,data?:{[key: string]: any},formData?: AxiosRequestConfig,catchError?: boolean)=>Promise<R>;
    PNget:<R = any>(url: string,catchError?: boolean)=>Promise<R>;
    PNgraph:<R = any>(url: string,query: string)=>Promise<R>;
    fetcher:<R = any>(url: string)=>Promise<R>;

}

export const API: AxiosInstance;

export default function useAPI(): APIResponseTypes