import React from 'react'
import Clipboard from 'expo-clipboard';
import { AuthContext } from '@pn/provider/AuthProvider';
import i18n from 'i18n-js'

export default function(){
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const copyText=(text,type="URL")=>{
        Clipboard.setString(text);
        setNotif('success',i18n.t('clipboard',{type:type}))
    }
    return {copyText}
}