import React from 'react'
import useSWRR from "swr"
import {fetcher} from './API'
import {API_URL,API_URL_2} from '@env'

export default function useSWR(path,config={},user=false){
    const url = user ? API_URL_2 + path : API_URL + path
    return useSWRR(url,fetcher,config)
}