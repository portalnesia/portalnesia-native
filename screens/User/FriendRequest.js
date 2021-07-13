import React from 'react'


import Layout from "@pn/components/global/Layout";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import useSelector from '@pn/provider/actions'

export default function FriendRequestScreen({navigation,route}){
    const user = useSelector(state=>state.user);
    const context = React.useContext(AuthContext);
    const {setNotif} = context;

    return (
        <Layout navigation={navigation}>
            
        </Layout>
    )
}