import {AxiosRequestConfig} from 'axios'
import {ApiResponse} from '@pn/utils/API'

type PNpostType = <D = {liked: boolean}>(url: string, data?: {
    [key: string]: any;
}, formdata?: AxiosRequestConfig, catchError?: boolean) => Promise<ApiResponse<D>>

export async function sentLike(PNpost: PNpostType,type: string, item_id: string|number) {
    const res = await PNpost(`/backend/like`,{type,id:item_id})
    return res;
}

