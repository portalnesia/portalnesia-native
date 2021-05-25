import React from 'react'


import Layout from "@pn/components/global/Layout";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'

export default function NotificationSettingScreen({navigation,route}){
    const context = React.useContext(AuthContext);
    const {setNotif,state:{user}} = context;

    return (
        <Layout navigation={navigation}>
            
        </Layout>
    )
}