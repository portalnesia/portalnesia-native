import React from 'react'
import {View} from 'react-native'
import {Text} from '@ui-kitten/components'
import {PortalHost} from '@gorhom/portal'

import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button';
import {Comments} from '@pn/components/global/Comment';

export default function CommentModal({navigation,route}){
    const {type,posId,posUrl,comment_id} = route.params;
    return (
        <>
            <Layout navigation={navigation} withClose whiteBg title="Comments">
                <Comments posId={posId} posUrl={posUrl} type={type} comment_id={comment_id} />
            </Layout>
            <PortalHost name="comment-option" />
        </>
    )
}