import React from 'react'
import Clipboard from 'expo-clipboard';
import { AuthContext } from '@pn/provider/AuthProvider';

export default function(){
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const copyText=(text,type="URL")=>{
        Clipboard.setString(text);
        setNotif('success',`${type} copied`)
    }
    return {copyText}
}