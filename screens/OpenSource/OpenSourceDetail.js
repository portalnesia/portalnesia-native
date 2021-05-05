import React from 'react'
import {Dimensions,ScrollView,RefreshControl,View} from 'react-native'
import {useTheme,Layout as Lay, Text} from '@ui-kitten/components'
import axios from 'axios';
import {openBrowserAsync} from 'expo-web-browser'

import Button from '@pn/components/global/Button';
import Layout from '@pn/components/global/Layout'
import Skeleton from '@pn/components/global/Skeleton'
import NotFound from '../NotFound'
import Error from '@pn/components/global/NotFound'
import style from '@pn/components/global/style'
import useSWR from 'swr'
import {fetcher} from '@pn/utils/API'

const {width} = Dimensions.get('window');

export default function OpenSourceDetailScreen({navigation,route}){
    if(!route?.params?.url) return <NotFound navigation={navigation} />

    //const [data,setData] = React.useState();
    //const [error,setError] = React.useState(false);
    const theme = useTheme();
    const {data,error,mutate,isValidating} = useSWR(route?.params?.url||null,{
        fetcher,
        revalidateOnFocus:false,
        revalidateOnMount:false,
        revalidateOnReconnect:true,
    })

    React.useEffect(()=>{
        if(!data) mutate();
    },[data])

    /*React.useEffect(()=>{
        if(error) {
            console.log(route?.params?.url,error)
        }
    },[error])*/

    const onPress=()=>{
        openBrowserAsync(route?.params?.url,{
            enableDefaultShare:true,
            toolbarColor:'#2f6f4e',
            showTitle:true
        })
    }

    return (
        <Layout navigation={navigation} withBack title="Open Source Libraries" subtitle={route?.params?.title} {...(data !== null && data !== undefined && !error ? {whiteBg:true} : {})}>
            {!data && !error ? (
                <Skeleton type="article" />
            ) : error  ? (
                <Error status={503}>
                    <Text>Something went wrong.</Text>
                    <View style={{marginTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Button appearance="ghost" status="basic" onPress={()=>mutate()}>Refresh</Button>
                        <Button appearance="ghost" status="basic" onPress={onPress}>Open in browser</Button>
                    </View>
                </Error>
            ) : (
                <ScrollView
                    contentContainerStyle={{flexGrow:1}}
                    {...(data && !error ? {refreshControl: <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}

                >
                    <Lay style={[style.container,{paddingVertical:20}]}><Text>{data}</Text></Lay>
                </ScrollView>
            )}
        </Layout>
    )
}