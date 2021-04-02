import React,{useMemo} from 'react'
import { useSWRInfinite } from "swr"
import useAPI from './API'
import { AuthContext } from '@pn/provider/AuthProvider';

export default function usePagination(path,data_name,limit,news,user=false){
    const {fetcher}=useAPI()
    const context = React.useContext(AuthContext)
    const {state}=context
    const {user:stateUser,session}=state;
    const PAGE_LIMIT = limit||10

    const { data, error, size, setSize,mutate,isValidating } = useSWRInfinite(
        (index,previous)=>{
            if(stateUser===null || session === null) return null;
            if(path===null) return null;
            if(previous && previous?.load===false) return null
            const ppath=path.match(/\?/) !== null ? '&page=' : '?page=';
            if(index==0) return `${path}${ppath}${news ? 0 : 1}`
            if(previous && previous?.page) return `${path}${ppath}${news ? previous?.page : previous?.page+1}`
            return `${path}${ppath}${news ? index : index + 1}` 
        },
        fetcher
    )

    const posts=useMemo(()=>{
        if(data) {
            const arr = data.map(dt=>dt?.[data_name])
            return [].concat(...arr)
        }
        else return []
    },[data,data_name,size])

    const isLoadingInitialData = !data && !error
    const isLoadingMore =
        //isLoadingInitialData ||
        (data && typeof data?.[size - 1] === 'undefined')
    const isEmpty = data?.[0]?.[data_name]?.length === 0
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.[data_name]?.length < PAGE_LIMIT)

    return { data:posts, error, isLoadingMore, size, setSize, isReachingEnd,response:data,mutate,isValidating,isLoadingInitialData}
}