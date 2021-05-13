import React from 'react'
import i18n from 'i18n-js'

import Layout from '@pn/components/global/Layout';
import {Comments} from '@pn/components/global/Comment';

export default function CommentModal({navigation,route}){
    const {type,posId,posUrl,comment_id} = route.params;
    return (
        <Layout navigation={navigation} withBack whiteBg title={i18n.t('comments')}>
            <Comments posId={posId} posUrl={posUrl} type={type} comment_id={comment_id} />
        </Layout>
    )
}