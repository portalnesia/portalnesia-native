import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,Divider,useTheme,Spinner} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import usePost from '@pn/utils/API'

import Layout from '@pn/components/global/Layout';
//import Image from '@pn/components/global/Image';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {Parser,Markdown} from '@pn/components/global/Parser'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import TableContent from '@pn/components/global/TableContent'
import {getCollapsOpt} from '@pn/utils/Main'
import {useCollapsibleHeader} from 'react-navigation-collapsible'
//const ShareIcon=(props)=><Icon {...props} name="ios-share" pack="material" />

const heightHeader = 46;
export default function({navigation,route}){
    const {slug,navbar} = route.params
    const [open,setOpen]=React.useState(false)
    const {data,error,mutate,isValidating}=useSWR(`/pages/${slug}`)
    const theme = useTheme()
    const [ready,setReady]=React.useState(false)
    const {PNget} = usePost();
    const scrollRef = React.useRef(null)
    const [yLayout,setYLayout]=React.useState(0);
    const [content,setContent] = React.useState([]);
    const [tableShow,setTableShow] = React.useState(false)

    const {scrollIndicatorInsetTop,onScrollWithListener,translateY} = useCollapsibleHeader(getCollapsOpt(theme))

    const scrollAnim = new Animated.Value(0);
    const onScroll = onScrollWithListener((e)=>{
        scrollAnim.setValue(e?.nativeEvent?.contentOffset?.y);
    })
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
            await analytics().logSelectContent({
                content_type:'user',
                item_id:String(data?.users?.id)
            })
            await PNget(`/pages/${slug}/update`);
            setReady(true)
        }

        if(data && !data?.error && !ready && !__DEV__) {
            timeout = setTimeout(check,5000);
        }

        if(!data) {
            mutate();
        }
        
        return ()=>{
            if(ready) setReady(false)
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready,route])

    const onLayout=React.useCallback((e)=>{
        setYLayout(e?.nativeEvent?.layout?.y)
    },[])

    const onReceiveId=React.useCallback((id)=>{
        setContent(id)
    },[])

    const onShowContent=React.useCallback(()=>{
        setTableShow(true)
    },[])

    const onHideContent=React.useCallback(()=>{
        setTableShow(false)
    },[])

    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{data && !data?.error && setOpen(true)}} />,[data]);

    return (
        <>
            <Layout title={navbar||"Pages"} navigation={navigation} menu={menuToggle}>
                {content?.length > 0 && <TableContent.Text style={{alignItems:'center'}} sticky scrollAnim={scrollAnim} translateY={translateY} onPress={onShowContent} /> }
                
                <Animated.ScrollView
                    ref={scrollRef}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader
                    }}
                    scrollIndicatorInsets={{top:scrollIndicatorInsetTop+heightHeader}}
                    refreshControl={
                        <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={refreshing} onRefresh={onRefresh}/>
                    }
                    onScroll={onScroll}
                >
                    {!data && !error ? (
                        <View style={{height:'100%',paddingTop:15}}>
                            <Skeleton type="article" />
                        </View>
                    ) : error || data?.error ? (
                        <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                    ) : data?.pages?.text ? (
                        <>
                            <Lay style={[style.container,{paddingVertical:20}]}>
                                <Text category="h2" style={{paddingVertical:10}}>{data?.pages?.title}</Text>
                                <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                    <Text style={{fontSize:13}}>{`Last modified ${data?.pages?.date}`}</Text>
                                    <Text style={{fontSize:13}}>{`${data?.pages?.seen?.format} views`}</Text>
                                </Lay>
                                <Lay style={{paddingBottom:5,flexDirection:'row'}}>
                                    <Text style={{fontSize:13}}>By </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}}>{"Portalnesia"}</Text>
                                </Lay>
                            </Lay>
                            {content?.length > 0 && (
                                <>
                                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                                    <TableContent.Text onPress={onShowContent} />
                                </>
                            )}
                            <Divider style={{backgroundColor:theme['border-text-color']}} />
                            <Lay style={{paddingBottom:50}} onLayout={onLayout}>
                                {data?.pages?.format === 'html' ? (
                                    <Parser source={data?.pages?.text} selectable scrollRef={scrollRef} yLayout={yLayout} onReceiveId={onReceiveId} />
                                ) : (
                                    <Markdown source={data?.pages?.text} skipHtml={false} selectable scrollRef={scrollRef} yLayout={yLayout} onReceiveId={onReceiveId} />
                                )}
                                
                            </Lay>
                        </>
                    ) : null}
                </Animated.ScrollView>
            </Layout>
            {data && data?.error==0 && (
                 <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    type="pages"
                    item_id={data?.pages?.id}
                    share={{
                        link:`/pages/${data?.pages?.slug}?utm_campaign=pages`,
                        title:`${data?.pages?.title} - Portalnesia`
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
                    },{
                        title:i18n.t('report'),
                        action:'report'
                    }]}
                />
            )}
            {content?.length > 0 && <TableContent.Modal scrollRef={scrollRef} yLayout={yLayout} open={tableShow} onClose={onHideContent} content={content} />}
        </>
    )
}