import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,Spinner,Divider,useTheme,Card} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import analytics from '@react-native-firebase/analytics'
import Carousel from '@pn/components/global/Carousel';

import {linkTo,pushTo} from '@pn/navigation/useRootNavigation'
import Image from '@pn/components/global/Image'
import Comment from '@pn/components/global/Comment'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {Parser,Markdown} from '@pn/components/global/Parser'
import CountUp from '@pn/components/global/Countup'
import {ucwords,PNslug} from '@pn/utils/Main'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import {CONTENT_URL} from '@env'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import i18n from 'i18n-js'
import usePost from '@pn/utils/API'
import TableContent from '@pn/components/global/TableContent'

function BlogDetail({navigation,route}){
    const {slug} = route.params
    const [open,setOpen]=React.useState(false)
    const {data,error,mutate,isValidating}=useSWR(`/blog/${slug}`)
    const theme = useTheme()
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:0}	
	const heightHeader = heightt?.main + heightt?.sub
    const {PNget} = usePost();

    const scrollRef = React.useRef(null)
    const [yLayout,setYLayout]=React.useState(0);
    const [content,setContent] = React.useState([]);
    const [tableShow,setTableShow] = React.useState(false)

    const scrollAnim = new Animated.Value(0);
    const onScroll = (e)=>{
        scrollAnim.setValue(e?.nativeEvent?.contentOffset?.y);
    }
    const {translateY,...other} = useHeader(58,onScroll)

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            await analytics().logSelectContent({
                content_type:'blog',
                item_id:String(data?.blog?.id)
            })
            await PNget(`/blog/${slug}/update`);
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
    },[data,ready,slug])

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

    return (
        <>
        <Layout navigation={navigation}>
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 2,transform: [{translateY}]}}>
				<Header title='Blog' subtitle={data?.blog?.title||""} withBack navigation={navigation} height={56} menu={()=> <MenuToggle onPress={()=>{setOpen(true)}} />} />
			</Animated.View>
            {content?.length > 0 && <TableContent.Text style={{alignItems:'center'}} sticky scrollAnim={scrollAnim} translateY={translateY} onPress={onShowContent} /> }
            <Animated.ScrollView
                ref={scrollRef}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop:heightHeader+2
                }}
                refreshControl={
                    <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={isValidating && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>!isValidating && mutate()}/>
                }
                {...other}
            >
                {!data && !error ? (
                    <View style={{height:'100%',paddingTop:heightHeader+2}}>
                        <Skeleton type="article" />
                    </View>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : data?.blog?.text ? (
                    <>
                        <Lay style={[style.container,{paddingVertical:20}]}>
                            <Text category="h2" style={{paddingVertical:10}}>{data?.blog?.title}</Text>
                            <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <Text  numberOfLines={1} style={{flex:1,marginRight:20,fontSize:13}}>{`Last modified ${data?.blog?.date}`}</Text>
                                <Text style={{fontSize:13}}><Text><CountUp data={data?.blog?.seen} /></Text> <Text>views</Text></Text>
                            </Lay>
                            <Text>
                                <Text style={{fontSize:13}}>By </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}} onPress={()=>linkTo(`/user/${data?.blog?.users?.username}`)}>{data?.blog?.users?.name||"Portalnesia"}</Text>
                            </Text>
                        </Lay>
                        {content?.length > 0 && (
                            <>
                                <Divider style={{backgroundColor:theme['border-text-color']}} />
                                <TableContent.Text onPress={onShowContent} />
                            </>
                        )}
                        <Divider style={{backgroundColor:theme['border-text-color']}} />
                        <Lay style={{paddingBottom:20}} onLayout={onLayout}>
                            {data?.blog?.format === 'html' ? (
                                <Parser source={data?.blog?.text} selectable scrollRef={scrollRef} yLayout={yLayout} onReceiveId={onReceiveId} />
                            ) : (
                                <Markdown source={data?.blog?.text} skipHtml={false} selectable scrollRef={scrollRef} yLayout={yLayout} onReceiveId={onReceiveId} />
                            )}
                        </Lay>
                        <Divider style={{backgroundColor:theme['border-text-color']}} />
                        <Lay style={[style.container,{paddingBottom:20,paddingTop:20}]}>
                            <Text>Category: <Text status="info" style={{textDecorationLine:"underline"}} onPress={()=>linkTo(`/blog/category/${PNslug(data?.blog?.category)}`)} >{ucwords(data?.blog?.category)}</Text></Text>
                            <Text><Text>Tags: </Text>
                                {data?.blog?.tag?.map((dt,i)=>(
                                    <React.Fragment key={i}>
                                        <Text status="info" style={{textDecorationLine:"underline"}} onPress={()=>linkTo(`/blog/tags/${PNslug(dt)}`)}>{`${dt}`}</Text>
                                        {i+1 !== data?.blog?.tag?.length && <Text>, </Text>}
                                    </React.Fragment>
                                ))}
                            </Text>
                        </Lay>
                        <Lay style={{paddingVertical:5}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                        {data && data?.others?.length > 0 ? (
                            <Lay style={{paddingVertical:10,paddingBottom:20}}>
                                <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('others_type',{type:i18n.t('post')})}</Text>
                                <Carousel
                                    data={data?.others}
                                    renderItem={(props)=><RenderCaraousel {...props} />}
                                    autoplay
                                />
                            </Lay>
                        ): null}
                        {data && data?.blog?.id ? (
                            <Lay style={{paddingBottom:50}}>
                                <Comment navigation={navigation} total={data?.blog?.comment_count} type="chord" posId={data?.blog?.id} posUrl={`chord/${data?.blog?.slug}`} />
                            </Lay>
                        ): null}
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
               type="blog"
               item_id={data?.blog?.id}
               share={{
                   link:`/blog/${data?.blog?.slug}?utm_campaign=blog`,
                   title:`${data?.blog?.title} - Portalnesia`,
                   dialog:i18n.t('share_type',{type:"blog"})
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

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(`/blog/${item?.slug}`)}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 200,
						width: 200,
					}}
					source={{uri:`${CONTENT_URL}/img/url?size=500&export=twibbon&watermark=no&image=${encodeURIComponent(item.image)}`}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"600"}}>{item.title}</Text>
            <Text category="label" appearance="hint" style={{marginTop:10}}>{item.users?.name}</Text>
            <Text category="label" appearance="hint" style={{fontSize:10}}>{item.date}</Text>
		</Card>
	);
})

export default React.memo(BlogDetail);