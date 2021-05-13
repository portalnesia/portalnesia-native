import React from 'react'
import i18n from 'i18n-js'

import Layout from '@pn/components/global/Layout';
import {Comments} from '@pn/components/global/Comment';
import { ucwords } from '@pn/utils/Main';

export default function CommentModal({navigation,route}){
    const {type,posId,posUrl,comment_id} = route.params;
    return (
        <Layout navigation={navigation} withBack whiteBg title={ucwords(i18n.t('comment',{count:2}))}>
            <Comments posId={posId} posUrl={posUrl} type={type} comment_id={comment_id} />
        </Layout>
    )
}