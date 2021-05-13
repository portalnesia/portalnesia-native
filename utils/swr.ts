import React from 'react'
import useSWRR,{SWRConfiguration} from "swr"
import useAPI from './API'
import { AuthContext } from '@pn/provider/AuthProvider';

export default function useSWR<D=any,F=any>(path: string|null,config:SWRConfiguration={}){
    const context = React.useContext(AuthContext)
    const {state}=context
    const {user:stateUser,session}=state;
    const {fetcher}=useAPI();
    return useSWRR<D,F>(stateUser===null || session === null ? null : path,{
        fetcher,
        revalidateOnFocus:false,
        revalidateOnMount:false,
        revalidateOnReconnect:true,
        ...config
    })
}