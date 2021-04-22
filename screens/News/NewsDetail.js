import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Spinner} from '@ui-kitten/components'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'

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
//import {CONTENT_URL} from '@env'

//const MoreIcon=(props)=><Icon {...props} name="more-vertical" />

export default function({navigation,route}){
    const {source,title} = route.params
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(`/news/${source}/${title}`,{},false)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:0}	
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub
    const {PNget} = usePost();

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            await analytics().logSelectContent({
                content_type:'news',
                item_id:String(data?.id)
            })
            await PNget(`/news/${source}/${title}/update`);
            setReady(true)
        }

        if(data && !data?.error && !ready && !__DEV__) {
            timeout = setTimeout(check,5000);
        }
        return ()=>{
            if(ready) setReady(false)
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready,title])

    return (
        <>
        <Layout navigation={navigation} custom={
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title={"News"} subtitle={data?.title||""} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />} />
			</Animated.View>
        }>
            {!data && !error ? (
                <View style={{height:'100%',paddingTop:heightHeader+8}}>
                    <Skeleton type="article" />
                </View>
            ) : error || data?.error ? (
                <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
            ) : data?.text ? (
                <Animated.ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader+8
                    }}
                    {...other}
                    {...(!data && !error || (!isValidating && (!error || data?.error==0)) ? {refreshControl: <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}
                >
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
                    {data && data?.id ? (
                        <>
                            <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                            <Lay style={{paddingBottom:50}}>
                                <Comment navigation={navigation} total={data?.comment_count} type="news" posId={data?.id} posUrl={`news/${source}/${title}`} />
                            </Lay>
                        </>
                    ): null}
                </Animated.ScrollView>
            ) : null}
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
                    action:"share",
                    title:i18n.t('share'),
                },{
                    title:i18n.t('copy_link'),
                    action:'copy'
                },{
                    title:i18n.t('open_in_browser'),
                    action:'browser'
                }]}
            />
        )}
        </>
    )
}

/*
{data?.image?.length > 0 && (
                                <View style={{marginBottom:10}}>
                                    <Image fullSize source={{uri:`${CONTENT_URL}/img/url?image=${encodeURIComponent(data?.image)}&size=400`}} />
                                </View>
                            )}
*/