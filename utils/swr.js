import React from 'react'
import useSWRR from "swr"
import useAPI from './API'
import {API_URL,API_URL_2} from '@env'
import { AuthContext } from '@pn/provider/AuthProvider';

export default function useSWR(path,config={},user=false){
    const context = React.useContext(AuthContext)
    const {state}=context
    const {user:stateUser,session}=state;
    const {fetcher}=useAPI();
    return useSWRR(stateUser===null || session === null ? null : path,fetcher,config)
}