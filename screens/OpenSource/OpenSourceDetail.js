import React from 'react'
import {Dimensions,ScrollView} from 'react-native'
import {useTheme,Layout as Lay, Text} from '@ui-kitten/components'
import axios from 'axios';
import {openBrowserAsync} from 'expo-web-browser'

import Layout from '@pn/components/global/Layout'
import Skeleton from '@pn/components/global/Skeleton'
import NotFound from '../NotFound'
import Error from '@pn/components/global/NotFound'
import style from '@pn/components/global/style'

const {width} = Dimensions.get('window');

export default function OpenSourceDetailScreen({navigation,route}){
    if(!route?.params?.url) return <NotFound navigation={navigation} />

    const [data,setData] = React.useState();
    const [error,setError] = React.useState(false);
    const theme = useTheme();

    React.useEffect(()=>{
        axios.get(route?.params?.url)
        .then((res)=>{
            //console.log(res?.data)
            if(res?.data) setData(res.data);
            else setData(null);
        })
        .catch(()=>{
            setError(true)
            setData(null);
        });
    },[])

    const onPress=()=>{
        openBrowserAsync(route?.params?.url,{
            enableDefaultShare:true,
            toolbarColor:'#2f6f4e',
            showTitle:true
        })
    }

    return (
        <Layout navigation={navigation} withBack title="Open Source Libraries" subtitle={route?.params?.title} {...(data !== null && data !== undefined && !error ? {whiteBg:true} : {})}>
            {data === undefined ? (
                <Skeleton type="article" />
            ) : error || data === null ? (
                <Error status={503}>
                    <Text>Something went wrong.</Text>
                    <Button appearance="ghost" status="basic" onPress={onPress}>Open in browser</Button>
                </Error>
            ) : (
                <ScrollView
                    contentContainerStyle={{flexGrow:1}}
                >
                    <Lay style={[style.container,{paddingVertical:20}]}><Text>{data}</Text></Lay>
                </ScrollView>
            )}
        </Layout>
    )
}