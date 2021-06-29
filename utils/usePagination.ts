import React,{useMemo} from 'react'
import { useSWRInfinite } from "swr"
import useAPI from './API'
import { AuthContext } from '@pn/provider/AuthProvider';

type PaginationDataTypes={
    page: number,
    load?:boolean,
    total_page: number,
    pages: number,
    [key: string]: any
}

export default function usePagination<D extends PaginationDataTypes,E=any>(path: string,data_name: string,limit?: number,news?: boolean){
    const {fetcher}=useAPI()
    const context = React.useContext(AuthContext)
    const {state}=context
    const {user:stateUser,session}=state;
    const PAGE_LIMIT = limit||10

    const { data, error, size, setSize,mutate,isValidating } = useSWRInfinite<D,E>(
        (index,previous)=>{
            if(stateUser===null || session === null) return null;
            if(path===null) return null;
            if(previous && previous?.load===false) return null
            const ppath=path.match(/\?/) !== null ? '&page=' : '?page=';
            if(index==0) return `${path}${ppath}${news ? 0 : 1}`
            if(previous && typeof previous?.page === 'number') {
                return `${path}${ppath}${news ? previous?.page : Number(previous?.page)+1}`
            }
            return `${path}${ppath}${news ? index : index + 1}` 
        },
        {
            fetcher,
            revalidateOnFocus:false,
            revalidateOnMount:true,
            revalidateOnReconnect:true,
        }
    )

    const posts: []|any[] =useMemo(()=>{
        if(Array.isArray(data)) {
            const arr = data.map(dt=>dt[data_name])
            return [].concat(...arr)
        }
        else return []
    },[data,data_name,size])

    const isLoadingInitialData = !data && !error
    const isLoadingMore =
        //isLoadingInitialData ||
        Boolean((data && typeof data?.[size - 1] === 'undefined'))
    const isEmpty = Boolean(data?.[0]?.[data_name]?.length === 0)
    const isReachingEnd = Boolean(isEmpty || (data && data[data.length - 1]?.[data_name]?.length < PAGE_LIMIT))

    return { data:posts, error, isLoadingMore, size, setSize, isReachingEnd,response:data,mutate,isValidating,isLoadingInitialData}
}