import React from 'react'
import {View} from 'react-native'
import {Text} from '@ui-kitten/components'

import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button';

export default function({navigation,route}){
    const {src} = route?.params
    console.log(src);
    return (
        <Layout navigation={navigation} withClose>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                
            </View>
        </Layout>
    )
}