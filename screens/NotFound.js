import React from 'react';
import { View } from 'react-native';

import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'

export default function NotFoundScreen({navigation}){

    return (
        <Layout navigation={navigation} withBack title="Not Found">
            <NotFound status={404} />
        </Layout>
    )
}