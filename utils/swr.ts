import React from 'react'
import useSWRR,{SWRConfiguration} from "swr"
import useAPI from './API'
import { AuthContext } from '@pn/provider/Context';

export default function useSWR<D=any,F=any>(path: string|null,config:SWRConfiguration={},autoValidate=false){
    const context = React.useContext(AuthContext)
    const {state:{user,session}}=context
    const {fetcher}=useAPI();
    return useSWRR<D,F>(user===null || session === null ? null : path,{
        fetcher,
        revalidateOnReconnect:true,
        ...(autoValidate ? {revalidateOnMount:true,revalidateOnFocus:true} : {revalidateOnMount:false,revalidateOnFocus:false}),
        ...config
    })
}