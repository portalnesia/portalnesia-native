import {AxiosRequestConfig,AxiosInstance} from 'axios'

export interface APIResponseTypes {
    PNpost:<R = any>(url: string,data?:{[key: string]: any},formData?: AxiosRequestConfig,catchError?: boolean)=>Promise<R>;
    PNget:<R = any>(url: string,catchError?: boolean)=>Promise<R>;
    PNgraph:<R = any>(url: string,query: string)=>Promise<R>;
    fetcher:<R = any>(url: string)=>Promise<R>;
    PNgetPkey:()=>Promise<{pkey: string}>
}

export const API: AxiosInstance;

export function fetcher<R = any>(url: string,option?: AxiosRequestConfig): Promise<R>

export default function useAPI(): APIResponseTypes