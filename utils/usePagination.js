import {useMemo} from 'react'
import { useSWRInfinite } from "swr"
import {fetcher} from './API'
import {API_URL,API_URL_2} from '@env'


export default function usePagination(path,data_name,limit,news,user=false){
    if (!path) {
        throw new Error("Path is required")
    }

    const url = user ? API_URL_2 + path : API_URL + path
    //console.log(url)
    const PAGE_LIMIT = limit||10

    const { data, error, size, setSize,mutate,isValidating } = useSWRInfinite(
        (index,previous)=>{
            if(previous && previous?.load===false) return null
            if(index==0) return `${url}?page=${news ? 0 : 1}`
            if(previous && previous?.page) return `${url}?page=${news ? previous?.page : previous?.page+1}`
            return `${url}?page=${news ? index : index + 1}` 
        },
        fetcher
    )

    const posts=useMemo(()=>{
        if(data) {
            const arr = data.map(dt=>dt?.[data_name])
            return [].concat(...arr)
        }
        else return []
    },[data,data_name])

    const isLoadingInitialData = !data && !error
    const isLoadingMore =
        //isLoadingInitialData ||
        (data && typeof data?.[size - 1] === 'undefined')
    const isEmpty = data?.[0]?.[data_name]?.length === 0
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.[data_name]?.length < PAGE_LIMIT)

    return { data:posts, error, isLoadingMore, size, setSize, isReachingEnd,response:data,mutate,isValidating,isLoadingInitialData}
}