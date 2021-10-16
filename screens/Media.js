import React from 'react'
import {FlatList,Dimensions,View} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Card} from '@ui-kitten/components'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'

import CountUp from '@pn/components/global/Countup'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from './NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import Skeleton,{ListSkeleton} from '@pn/components/global/Skeleton'
import {linkTo} from '@pn/navigation/useRootNavigation'
import Player from '@pn/components/global/VideoPlayer'
import Avatar from '@pn/components/global/Avatar'
import ListItem from '@pn/components/global/ListItem'
import useTrackPlayer from '@pn/components/musicPlayer/Action'
import { CONTENT_URL } from '@env'
import useAPI from '@pn/utils/API'

const winHeight = Dimensions.get('window').height;

const RenderItem=React.memo(({item,index})=>{
    const accessoryRight=React.useCallback(()=><MemoAvatar src={item?.thumbs} />,[item])
    return (
        <ListItem onPress={()=>linkTo(`/media/${item?.id}`)} key={index.toString()} title={item?.title} accessoryLeft={accessoryRight} style={{paddingVertical:5}} />
    )
})
const renderItem=(props)=> <RenderItem {...props} />
const MemoAvatar=React.memo(({src})=>(
    <Avatar style={{marginRight:10}} src={src} size={45} />
))
const RenderHeader=React.memo(({data})=>{
    const theme=useTheme();
    return (
        <>
        <Lay style={style.container}>
            <Text category="h3" style={{paddingVertical:10}}>{data?.file?.title}</Text>
            <Lay key="lay-1" style={{flexDirection:'row',alignItems:"flex-end",justifyContent:'space-between'}}>
                <Text numberOfLines={1} style={{fontSize:13}}>{`${data?.file?.date}`}</Text>
                {typeof data?.file?.seen?.number !== 'undefined' && <Text style={{fontSize:13}}><Text style={{fontSize:13}}><CountUp data={data?.file?.seen} /></Text> <Text style={{fontSize:13}}>views</Text></Text> }
            </Lay>
            <Lay key="lay-2" style={{flexDirection:'row',alignItems:"flex-end",justifyContent:'space-between'}}>
                <Text>
                    <Text style={{fontSize:13}}>By </Text>
                    <Text style={{fontSize:13,textDecorationLine:"underline"}} status="info" onPress={()=>linkTo(`/user/${data?.file?.users?.username}`)} >{`${data?.file?.users?.name}`}</Text>
                </Text>
            </Lay>
        </Lay>
        <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
        </>
    )
})

export default function MediaScreen({navigation,route}){
    const slug = route?.params?.slug;
    if(!slug) return <NotFoundScreen navigation={navigation} route={route} />
    const {data,error}=useSWR(`/media/${slug}`,{},true);
    const {data:dataOthers,mutate,isValidating}=useSWR(`/media/other/${slug}`);
    const theme = useTheme();
    const {PNget} = useAPI();
    const {setupPlayer} = useTrackPlayer();

    React.useEffect(()=>{
        async function getData() {
            if(data) {
                if(data?.file?.type === 'audio') {
                    navigation?.goBack()
                    setupPlayer({
                        id:data?.file?.id,
                        id_number:data?.file?.id_number,
                        title:data?.file?.title,
                        artist:data?.file?.artist,
                        url:data?.file?.url,
                        artwork:`${CONTENT_URL}/img?export=twibbon&source=images&image=lagu.png`
                    })
                }
            }
        }
        getData();
    },[data])

    React.useEffect(()=>{
        async function getData() {
            if(data) {
                if(data?.file?.type !== 'audio') {
                    if(!dataOthers || dataOthers?.error) {
                        mutate();
                    }
                    if(!__DEV__) await PNget(`/media/${data?.file?.id}/update`);
                }
            }
        }
        getData();
    },[data,dataOthers])

    const onChangeState=React.useCallback((e)=>{
        // if(e.state === 'stopped')
    },[])

    const renderEmpty=React.useCallback(()=>{
        if(!dataOthers || isValidating) return <ListSkeleton height={winHeight} number={10} image />
        return (
            <Text>No data</Text>
        )
    },[dataOthers,isValidating])
    const renderHeader=React.useCallback(()=><RenderHeader data={data} />,[data])

    return(
        <>
            <Layout navigation={navigation} title="Media" {...(data?.file?.title ? {subtitle:data.file.title} : {})}>
                {(!data && !error) || (data && data?.file?.type === 'audio') ? (
                    <View style={{height:'100%',paddingTop:15}}>
                        <Skeleton type="article" />
                    </View>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||i18n.t("errors.general")}</Text></NotFound>
                ) : (
                    <React.Fragment>
                        {data?.file?.type === 'youtube' && data?.file?.youtube_id ? (
                            <Lay style={{paddingBottom:10}}>
                                <Player youtube={data?.file?.youtube_id} youtubeOptions={{onChangeState}} />
                            </Lay>
                        ) : null}
                        <FlatList
                            data={dataOthers?.file ? dataOthers.file : []}
                            ListEmptyComponent={renderEmpty}
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{backgroundColor:theme['background-basic-color-1'],...(dataOthers && dataOthers?.file?.length === 0 ? {flex:1} : {flexGrow:1})}}
                            ListHeaderComponent={renderHeader}
                            renderItem={renderItem}
                            ItemSeparatorComponent={Divider}
                        />
                    </React.Fragment>
                )}
            </Layout>
        </>
    )
}