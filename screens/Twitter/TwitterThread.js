import React from 'react';
import { Animated,RefreshControl,useWindowDimensions,View,LogBox } from 'react-native';
import {Layout as Lay,Text,useTheme,Divider,Icon,Card} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import {pushTo} from '@pn/navigation/useRootNavigation'
import Carousel from '@pn/components/global/Carousel';

import Comment from '@pn/components/global/Comment'
import CountUp from '@pn/components/global/Countup'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import VideoPlayer from '@pn/components/global/VideoPlayer'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Image from '@pn/components/global/Image'
import {CONTENT_URL} from '@env'
import WebView from 'react-native-autoheight-webview'
import { AuthContext } from '@pn/provider/AuthProvider';
import Button from '@pn/components/global/Button'
import {specialHTML,listToMatrix,openBrowser,Ktruncate} from '@pn/utils/Main'
import useClipboard from '@pn/utils/clipboard'
import usePost from '@pn/utils/API'

LogBox.ignoreLogs(['Cannot update a component from inside the function body']);

const MoreIcon=(props)=><Icon {...props} style={{...props?.style,marginHorizontal:0}} name="more-vertical" />

const RenderTwitter=React.memo(({item,index,setMenu})=>{
    const {width} = useWindowDimensions()
    const context = React.useContext(AuthContext);
    const {theme:contextTheme} = context
    const theme=useTheme()
    const {copyText} = useClipboard()
    const ads = index % 20;
    return (
        <Lay key={`thread-${index}`} >
            {ads === 1 ? (
                <View key={`ads-1-${index}`} style={{marginTop:20}}>
                    <AdsBanner key={`ads-ads-1-${index}`} size="MEDIUM_RECTANGLE" />
                    <Divider key={`ads-banner-1-${index}`} style={{marginTop:20,backgroundColor:theme['border-text-color']}} />
                </View>
            ) : ads === 11 ? (
                <View key={`ads-2-${index}`} style={{marginTop:20}}>
                    <AdsBanners key={`ads-ads-2-${index}`} size="MEDIUM_RECTANGLE" />
                    <Divider key={`ads-banner-2-${index}`} style={{marginTop:20,backgroundColor:theme['border-text-color']}} />
                </View>
            ) : null}
            <Lay key={`layout-${index}`} style={{marginTop:20,flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',paddingLeft:15}}>
                <Lay key={`layout-index-${index}`} style={{flex:1}}>
                    <Text key={`tweet-${index}`} style={{lineHeight:23}}>{specialHTML(item?.tweet)}</Text>
                    {item?.url?.length > 0 ? item?.url?.map((u,i)=>
                        u?.url.match(/^https?\:\/\/twitter\.com/)===null ? (
                            <Text key={`url-${index}-${i}`} style={{fontSize:13,textDecorationLine:"underline",lineHeight:23}} status="info" onPress={()=>openBrowser(u.url)} onLongPress={()=>copyText(u.url)} >{u?.text}</Text>
                        ) : null
                    ) : null}
                </Lay>
                <Lay key={`layout-option-${index}`}>
                    <View style={{borderRadius:20,overflow:'hidden'}}>
                        <Button appearance="ghost" size="small" status="basic" style={{padding:0}} accessoryLeft={MoreIcon} onPress={()=>setMenu(index)} />
                    </View>
                </Lay>
            </Lay>
            <Lay key={`media-${index}`} style={{marginTop:10}}>
                {item?.media ? 
                    item?.media?.photo_count === 1 ? 
                        item.media.urls.map((m,i)=>(
                            <View key={`image-${index}-${i}`} style={{marginVertical:2}}>
                                <Image contentWidth={width} fancybox fullSize source={{uri:`${CONTENT_URL}/img/url?height=200&size=400&image=${encodeURIComponent(m.url)}`}} dataSrc={{uri:m.url}} />
                            </View>
                        ))
                    : item?.media?.photo_count === 2 ? (
                        <View key={`image-grid-${index}-0000`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            {item.media.urls.map((m,i)=>(
                                <View key={`image-${index}-${i}`} style={{marginVertical:2}}>
                                    <Image contentWidth={(width/2)-2} fancybox fullSize source={{uri:`${CONTENT_URL}/img/url?height=200&size=400&image=${encodeURIComponent(m.url)}`}} dataSrc={{uri:m.url}} />
                                </View>
                            ))}
                        </View>
                    ) : item?.media?.photo_count > 2 ? listToMatrix(item.media.urls,2).map((root,i)=>(
                        <View key={`image-grid-${index}-${i}`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            {root.map((m,ii)=>(
                                <View key={`image-${index}-${i}-${ii}`} style={{marginVertical:2}}>
                                    <Image fancybox contentWidth={i===0 || item?.media?.photo_count > 3 ? (width/2)-2 : width} fullSize source={{uri:`${CONTENT_URL}/img/url?height=200&size=400&image=${encodeURIComponent(m.url)}`}} dataSrc={{uri:m.url}} />
                                </View>
                            ))}
                        </View>
                    )) : item?.media?.video_count > 0 ? (
                        <VideoPlayer key={`video-${index}`} src={item?.media?.urls?.[0]?.url} poster={item?.media?.urls?.[0]?.poster} />
                    )
                    : null
                : null}
                {item?.url?.length > 0 ? item?.url?.map((u,ii)=>{
                    if(u?.url.match(/^https?\:\/\/twitter\.com/)) {
                        const html = `
                            <script src="https://platform.twitter.com/widgets.js" id="twitter-wjs"></script><div id="embedTwitter"></div>
                        `
                        const customScript = `window.twttr.widgets.createTweet("${u?.id}",document.getElementById("embedTwitter"),{conversation:'none',align:'center',theme:'${contextTheme}'})`
                        return (
                            <View key={`tweet-embed-${index}-${ii}`}>
                                <WebView
                                    allowsFullscreenVideo
                                    key={`webview-${index}-${ii}`}
                                    style={{ width: width - 10, marginVertical: 20,marginHorizontal:5 }}
                                    source={{html,baseUrl:"https://twitter.com"}}
                                    customScript={customScript}
                                    viewportContent={'width=device-width, user-scalable=no'}
                                />
                            </View>
                        )
                    }
                    return null
                }) : null}
            </Lay>
            <Divider key={`divider-${index}`} style={{marginTop:20,backgroundColor:theme['border-text-color']}} />
        </Lay>
    )
})

export default function TwitterThread({navigation,route}){
    const {slug} = route.params
    if (slug === 'popular') {
        navigation.replace("Twitter",{slug:'popular'})
        return null;
    }
    //const context = React.useContext(AuthContext);
    //const {state} = context
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(slug !== 'popular' ? `/twitter/${slug}` : null)
    const {data:dataOthers,error:errorOthers,mutate:mutateOthers,isValidating:isValidatingOthers} = useSWR(data?.id ? `/twitter/others/${data?.id}` : null)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:0}	
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub
    const {width} = useWindowDimensions()
    const [menu,setMenu]=React.useState(null)
    const {copyText} = useClipboard()
    const {PNget} = usePost();

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            if(!__DEV__) {
                await analytics().logSelectContent({
                    content_type:'twitter_thread',
                    item_id:String(data?.id)
                })
                await PNget(`/twitter/${slug}/update`);
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
    },[data,ready,route])

    const HeaderComp = ()=>(
        <Lay style={{flex:1}}>
            <Lay key={0} style={[style.container,{paddingTop:10}]}>
                <Text category="h3">{`Thread by @${data?.screen_name}`}</Text>
                <Lay key="lay-0" style={{marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <Text numberOfLines={1} style={{flex:1,marginRight:20,fontSize:13,textDecorationLine:"underline"}} status="info" onPress={()=>openBrowser(`https://twitter.com/${data?.screen_name}/status/${data?.id}`) }>Original Thread</Text>
                    <Text style={{fontSize:13}}><Text><CountUp data={data?.seen} /></Text> <Text>views</Text></Text>
                </Lay>
            </Lay>
            <Divider style={{marginVertical:20,marginBottom:0,backgroundColor:theme['border-text-color']}} />
        </Lay>
    )

    const RenderFooter=()=>{
        if(data && data?.id){
            return (
                <>
                    <Lay style={{paddingTop:20,paddingBottom:20}}>
                        <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended')}</Text>
                        {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{paddingHorizontal:15}}><Skeleton type='caraousel' height={100} /></Lay>
                        : errorOthers || dataOthers?.error==1 ? (
                            <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                        ) : dataOthers?.data?.popular?.length > 0 ? (
                            <Carousel
                                data={dataOthers?.data?.popular}
                                renderItem={(props)=><RenderCaraousel {...props} />}
                                autoplay
                            />
                        ) : (
                            <Text style={{paddingHorizontal:15}}>No thread</Text>
                        )}
                    </Lay>
                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                    <Lay style={{paddingBottom:50,paddingTop:10}}>
                        <Comment navigation={navigation} total={data?.comment_count} type="news" posId={data?.id} posUrl={`twitter/thread/${data?.id}`} />
                    </Lay>
                </>
            )
        }
        return null;
    }

    const renderEmpty=()=>{
		if(error || Boolean(data?.error)) return <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
		return <View style={{height:'100%'}}><Skeleton type="article" /></View>
	}

    return (
        <>
        <Layout navigation={navigation}>
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title={"Twitter Thread Reader"} subtitle={data?.screen_name ? `Thread by @${data?.screen_name}` : ""} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />} />
            </Animated.View>
            <Animated.FlatList
                ListEmptyComponent={renderEmpty}
                ListHeaderComponentStyle={{
                    flexGrow: 1,
                    paddingTop:heightHeader + 2,
                }}
                refreshControl={
                    <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={isValidating && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>!isValidating && mutate()}/>
                }
                data={data ? data?.tweets : []}
                ListHeaderComponent={HeaderComp}
                renderItem={({item,index})=>(
                    <RenderTwitter index={index} item={item} setMenu={setMenu} />
                )}
                keyExtractor={(item, index) => 'twitter-thread-'+index}
                ListFooterComponent={RenderFooter}
                {...other}
            />
        </Layout>
        {data && !data?.error && (
                <>
                    <MenuContainer
                        key="menu-1"
                        visible={open}
                        handleOpen={()=>setOpen(true)}
                        handleClose={()=>setOpen(false)}
                        onClose={()=>setOpen(false)}
                        type="twitter_thread"
                        item_id={data?.id}
                        share={{
                            link:`/twitter/thread/${data?.id}?utm_campaign=twitter_thread`,
                            title:`${Ktruncate(specialHTML(data?.tweets?.[0]?.tweet),150)} - Portalnesia`,
                            dialog:i18n.t('share_type',{type:i18n.t('twitter_thread')})
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
                    <MenuContainer
                        visible={menu!==null}
                        handleOpen={()=>setMenu(menu)}
                        handleClose={()=>setMenu(null)}
                        onClose={()=>setMenu(null)}
                        menu={[{
                            title:`${i18n.t('copy')} ${i18n.t('text').toLowerCase()}`,
                            onPress:()=>{
                                copyText(specialHTML(data?.tweets?.[menu]?.tweet),"Text")
                                setMenu(null)
                            }
                        }]}
                    />
                </>
            )}
        </>
    )
}

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(`/twitter/thread/${item?.id}`)}>
			<Text category="p1" style={{fontWeight:"600"}}>{specialHTML(item?.title)}</Text>
            <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${item?.screen_name}`}</Text>
		</Card>
	);
})