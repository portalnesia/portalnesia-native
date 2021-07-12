import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Card} from '@ui-kitten/components'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'

import Carousel from '@pn/components/global/Carousel';
import CountUp from '@pn/components/global/Countup'
import Button from '@pn/components/global/Button';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {Parser} from '@pn/components/global/Parser'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import {ucwords,openBrowser} from '@pn/utils/Main'
import Skeleton from '@pn/components/global/Skeleton'
import Comment from '@pn/components/global/Comment'
import usePost from '@pn/utils/API'
import {pushTo} from '@pn/navigation/useRootNavigation'
import PullRefresh from '@pn/components/global/PullRefresh'

//const MoreIcon=(props)=><Icon {...props} name="more-vertical" />

export default function({navigation,route}){
    const {source,title} = route.params
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(`/news/${source}/${title}`)
    const {data:dataOthers,error:errorOthers,mutate:mutateOthers,isValidating:isValidatingOthers} = useSWR(data?.id ? `/news/others/${data.id}` : null)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const [liked,setLiked] = React.useState(false)
    const pullRefreshRef = React.useRef(null);
    const heightt = {...headerHeight,sub:0}	

    const onScroll=(e)=>{
        pullRefreshRef.current?.onScroll(e)
    }

    const {translateY,...other} = useHeader(58,onScroll)
	const heightHeader = heightt?.main + heightt?.sub
    const {PNget} = usePost();
    const [refreshing,setRefreshing] = React.useState(false);

    const onRefresh=React.useCallback(()=>{
        if(!isValidating) {
            setRefreshing(true);
            mutate();
        }
    },[isValidating])

    React.useEffect(()=>{
        if(!isValidating) setRefreshing(false)
    },[isValidating])

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            if(!__DEV__) {
                await analytics().logSelectContent({
                    content_type:'news',
                    item_id:String(data?.id)
                })
                await PNget(`/news/${source}/${title}/update`);
            }
            setReady(true)
        }

        if(data && !data?.error && !ready) {
            timeout = setTimeout(check,5000);
            mutateOthers();
        }
        if(!data) {
            mutate();
        }
        return ()=>{
            if(ready) setReady(false)
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready,title])

    const handleOnSuccess=React.useCallback((val)=>{
        mutate({
            ...data,
            liked:val
        })
    },[data,mutate])

    React.useEffect(()=>{
        if(data) {
            setLiked(data?.liked);
        }
    },[data])

    return (
        <>
        <Layout navigation={navigation}>
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title={"News"} subtitle={data?.title||""} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{data && !data?.error && setOpen(true)}} />} />
			</Animated.View>
            <PullRefresh ref={pullRefreshRef} onRefresh={onRefresh} refreshing={refreshing} headerHeight={heightHeader}>
                <Animated.ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader+2
                    }}
                    {...other}
                >
                    {!data && !error ? (
                        <View style={{height:'100%',paddingTop:15}}>
                            <Skeleton type="article" />
                        </View>
                    ) : error || data?.error ? (
                        <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                    ) : data?.text ? (
                        <>
                            <Lay style={[style.container]}>
                                <Text category="h2" style={{paddingVertical:10}}>{data?.title}</Text>
                                <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                    <Text numberOfLines={1} style={{flex:1,marginRight:20,fontSize:13}}>{`Last modified ${data?.date_string}`}</Text>
                                    <Text style={{fontSize:13}}><Text><CountUp data={data?.seen} /></Text> <Text>views</Text></Text>
                                </Lay>
                            </Lay>
                            <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                            <Lay style={{paddingBottom:20}}><Parser source={data.text} selectable /></Lay>
                            <Lay>
                                <Lay style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                    <Button onPress={()=>openBrowser(data?.url)} text>Artikel Asli</Button>
                                </Lay>
                            </Lay>
                            <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                            {data && data?.id ? (
                                <>
                                    <Lay style={{paddingBottom:20}}>
                                        <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended')}</Text>
                                        {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{paddingHorizontal:15}}><Skeleton type='caraousel' image height={300} /></Lay>
                                        : errorOthers || dataOthers?.error==1 ? (
                                            <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                                        ) : dataOthers?.data?.length > 0 ? (
                                            <Carousel
                                                data={dataOthers?.data}
                                                renderItem={(props)=><RenderCaraousel {...props} />}
                                                autoplay
                                            />
                                        ) : (
                                            <Text style={{paddingHorizontal:15}}>No posts</Text>
                                        )}
                                    </Lay>
                                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                                    <Lay style={{paddingBottom:50,paddingTop:10}}>
                                        <Comment navigation={navigation} total={data?.comment_count} type="news" posId={data?.id} posUrl={`news/${source}/${title}`} />
                                    </Lay>
                                </>
                            ): null}
                        </>
                    ) : null}
                </Animated.ScrollView>
            </PullRefresh>
        </Layout>
        {data && !data?.error && (
            <MenuContainer
                visible={open}
                handleOpen={()=>setOpen(true)}
                handleClose={()=>setOpen(false)}
                onClose={()=>setOpen(false)}
                type="news"
                item_id={data?.id}
                share={{
                    link:`/news/${source}/${title}?utm_campaign=news`,
                    title:`${data?.title} - Portalnesia`,
                    dialog:i18n.t('share_type',{type:i18n.t('news')})
                }}
                menu={[{
                    action:"like",
                    title:i18n.t(liked ? "unlike" : "like"),
                    like:{
                        value:liked,
                        onSuccess:handleOnSuccess
                    }
                },{
                    action:"share",
                    title:i18n.t('share'),
                },{
                    title:i18n.t('copy_link'),
                    action:'copy'
                },{
                    title:i18n.t('open_in_browser'),
                    action:'browser'
                },{
                    title:i18n.t('report'),
                    action:'report'
                }]}
            />
        )}
        </>
    )
}

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(item?.url?.substring(23))}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 200,
						width: 200,
					}}
					source={{uri:item?.image}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"600"}}>{item.title}</Text>
            <Text category="label" appearance="hint" style={{marginTop:10}}>{item.source}</Text>
            <Text category="label" appearance="hint" style={{fontSize:10}}>{item.date_string}</Text>
		</Card>
	);
})