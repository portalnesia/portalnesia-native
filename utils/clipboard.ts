import React from 'react'
import {setString} from 'expo-clipboard';
import { AuthContext } from '@pn/provider/Context';
import i18n from 'i18n-js'

export default function useClipboard(){
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const copyText=(text: string,type="URL")=>{
        setString(text);
        setNotif('success',i18n.t('clipboard',{type}))
    }
    return {copyText}
}