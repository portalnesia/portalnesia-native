import React from 'react'
import useSWRR,{SWRConfiguration} from "swr"
import useAPI from './API'
import useSelector from '@pn/provider/actions'

export default function useSWR<D=any,F=any>(path: string|null,config:SWRConfiguration={},autoValidate=false){
    const {user,session} = useSelector(state=>({user:state.user,session:state.session}))
    const {fetcher}=useAPI();
    const swr = useSWRR<D,F>(user===null || session === null ? null : path,{
        fetcher,
        revalidateOnReconnect:true,
        ...(autoValidate ? {revalidateOnMount:true,revalidateOnFocus:true} : {revalidateOnMount:false,revalidateOnFocus:false}),
        ...config
    })

    React.useEffect(()=>{
        swr.mutate();
    },[user])

    return swr;
}