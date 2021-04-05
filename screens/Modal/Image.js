import React from 'react'
import {View} from 'react-native'
import {Text} from '@ui-kitten/components'

import PhotoView from '@pn/module/PNPhotoView';
import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button';

export default function({navigation,route}){
    const {src} = route?.params
    console.log(src);
    return (
        <Layout navigation={navigation} withClose>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                {typeof src === 'string' && (
                    <PhotoView
                        src={src}
                        panEnabled
                        style={{height:400,width:400}}
                    />
                )}
            </View>
        </Layout>
    )
}