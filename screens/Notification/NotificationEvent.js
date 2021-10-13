import React from 'react'
import {ScrollView, View,Dimensions} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider} from '@ui-kitten/components'
import Skltn from 'react-native-skeleton-placeholder'

import Layout from '@pn/components/global/Layout'
import {ImageFull as Image} from '@pn/components/global/Image'
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'

const {width,height} = Dimensions.get('window')

export default function NotificationEvent({navigation,route}){
    const {slug,token} = route?.params;
    if(!slug || !token) return <NotFound status={404} />
    const theme = useTheme();
    const {data,error} = useSWR(`/backend/notification_event/${slug}?token=${token}`,{},true);

    return (
        <Layout navigation={navigation} title="Notification" subtitle={data?.title||undefined} whiteBg>
            {!data && !error ? (
                <Skltn height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
                    <Skltn.Item key={0} width={width} height={width} marginBottom={15} />

                    <Skltn.Item borderRadius={4} width={width-80} marginLeft={40} marginRight={40} height={35} marginBottom={0} />

                    <Divider style={{backgroundColor:theme['border-text-color'],marginVertical:15}} />
                    
                    <Skltn.Item borderRadius={4} width={width-80} marginLeft={65} marginRight={15} height={20} marginBottom={5} />
                    <Skltn.Item borderRadius={4} width={width-30} marginLeft={15} marginRight={15} height={20} marginBottom={5} />
                    <Skltn.Item borderRadius={4} width={width-30} marginLeft={15} marginRight={15} height={20} marginBottom={5} />
                    <Skltn.Item borderRadius={4} width={width-80} marginLeft={15} marginRight={65} height={20} marginBottom={5} />
                    
                </Skltn>
            ) : error || data?.error ? (
                <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
            ) : (
                <ScrollView>
                    <View>
                        <Image source={{uri:data?.image}} alt={data?.title} fancybox />
                    </View>
                    <View style={{alignItems:'center',paddingHorizontal:15,paddingVertical:15}}>
                        <Text style={{fontFamily:"Inter_SemiBold",fontSize:24}}>{data?.title}</Text>
                    </View>
                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                    <View style={{paddingHorizontal:15,paddingVertical:15}}>
                        <Text>{data?.description}</Text>
                    </View>
                </ScrollView>
            )}
            
        </Layout>
    )
}