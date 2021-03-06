import React from 'react';
import { Animated,RefreshControl,useWindowDimensions,View,LogBox } from 'react-native';
import {Layout as Lay,Text,useTheme,Divider,Icon,Card} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import {pushTo} from '@pn/navigation/useRootNavigation'
import Carousel from '@pn/components/global/Carousel';

import Pressable from '@pn/components/global/Pressable'
import Recaptcha from '@pn/components/global/Recaptcha'
import Comment from '@pn/components/global/Comment'
import CountUp from '@pn/components/global/Countup'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import VideoPlayer from '@pn/components/global/VideoPlayer'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Image from '@pn/components/global/Image'
import NotFoundScreen from '../NotFound'
import {CONTENT_URL} from '@env'
import WebView from 'react-native-autoheight-webview'
import { AuthContext } from '@pn/provider/Context';
import Button from '@pn/components/global/Button'
import {specialHTML,listToMatrix,truncate as Ktruncate} from '@portalnesia/utils'
import {openBrowser,getCollapsOpt} from '@pn/utils/Main'
import useClipboard from '@pn/utils/clipboard'
import usePost from '@pn/utils/API'
import Spinner from '@pn/components/global/Spinner'
import LikeButton from '@pn/components/global/Like'
import useSelector from '@pn/provider/actions'
import {useCollapsibleHeader} from 'react-navigation-collapsible'

LogBox.ignoreLogs(['Cannot update a component from inside the function body']);

const MoreIcon=(props)=><Icon {...props} style={{...props?.style,marginHorizontal:0}} name="more-vertical" />

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(`/twitter/thread/${item?.id}`)}>
			<Text category="p1" style={{fontWeight:"600"}}>{specialHTML(item?.title)}</Text>
            <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${item?.screen_name}`}</Text>
		</Card>
	);
})

const renderCarousel=(props)=><RenderCaraousel {...props} />

const RenderTwitter=React.memo(({item,index,setMenu})=>{
    const {width} = useWindowDimensions()
    const contextTheme = useSelector(state=>state.theme);
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
    const slug = route?.params?.slug
    if(!slug) return <NotFoundScreen navigation={navigation} route={route} />
    if (slug === 'popular') {
        navigation.replace("Twitter",{slug:'popular'})
        return null;
    }
    const user = useSelector(state=>state.user);
    const context = React.useContext(AuthContext);
    const {setNotif} = context
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(slug !== 'popular' ? `/twitter/${slug}` : null)
    const {data:dataOthers,error:errorOthers,mutate:mutateOthers,isValidating:isValidatingOthers} = useSWR(data?.id && !__DEV__ ? `/twitter/others/${data?.id}` : null)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const [loading,setLoading]=React.useState(false)
    const [menu,setMenu]=React.useState(null)
    const {copyText} = useClipboard()
    const {PNget,PNpost} = usePost();
    const captchaRef = React.useRef(null)
    const [liked,setLiked] = React.useState(false);
    const [refreshing,setRefreshing] = React.useState(false);

    const {onScroll,containerPaddingTop,scrollIndicatorInsetTop} = useCollapsibleHeader(getCollapsOpt(theme))

    React.useEffect(()=>{
        if(!isValidating) setRefreshing(false)
    },[isValidating])

    const onRefresh=React.useCallback(()=>{
        if(!isValidating) {
            setRefreshing(true);
            mutate();
        }
    },[isValidating])

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            if(!__DEV__) {
                await analytics().logSelectContent({
                    content_type:'twitter_thread',
                    item_id:String(data?.tweet_id)
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

    const HeaderComp = React.useCallback(()=>{
        if(data && data?.id){
            return (
                <Lay style={{flex:1}}>
                    <Lay key={0} style={[style.container,{paddingTop:10}]}>
                        <Text category="h3">{`Thread by @${data?.screen_name}`}</Text>
                        <Lay key="lay-0" style={{marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text numberOfLines={1} style={{flex:1,marginRight:20,fontSize:13,textDecorationLine:"underline"}} status="info" onPress={()=>openBrowser(`https://twitter.com/${data?.screen_name}/status/${data?.id}`) }>Original Thread</Text>
                            <Text style={{fontSize:13}}><Text><CountUp data={data?.seen} /></Text> <Text>views</Text></Text>
                        </Lay>
                        <Lay key="lay-1" style={{flexDirection:'row',alignItems:"flex-start",justifyContent:"flex-end"}}>
                            <LikeButton value={liked} onSuccess={handleOnSuccess} type="twitter_thread" item_id={data?.tweet_id} />
                        </Lay>
                    </Lay>
                    <Divider style={{marginVertical:20,marginBottom:0,backgroundColor:theme['border-text-color']}} />
                </Lay>
            )
        }
        return null;
    },[data,theme,liked,handleOnSuccess])

    const RenderFooter=()=>{
        if(data && data?.id){
            return (
                <>
                    <Lay style={{paddingHorizontal:15,paddingTop:20,paddingBottom:20}}>
                        {loading ? (
                            <Lay style={{flex:1,justifyContent:'center',alignItems:'center',paddingVertical:15}}>
                                <Spinner size="large" />
                            </Lay>
                        ) : (
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                <Text>
                                    <Text>Missing tweets? </Text>
                                    <Text onPress={handleReload} style={{textDecorationLine:"underline",fontFamily:"Inter_Medium"}} status="info">Click here</Text>
                                    <Text> to reload.</Text>
                                </Text>
                                {user?.admin && (
                                    <View style={{borderRadius:22,overflow:'hidden'}}>
                                        <Pressable onPress={handleDelete} style={{padding:5}}><Icon name="trash-2-outline" width="20" height="20" fill={theme['color-danger-500']} /></Pressable>
                                    </View>
                                )}
                            </View>
                        )}
                        
                    </Lay>
                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                    <Lay style={{paddingTop:20,paddingBottom:10}}>
                        <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended')}</Text>
                        {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{padding:15}}><Skeleton type='caraousel' height={100} /></Lay>
                        : errorOthers || dataOthers?.error==1 ? (
                            <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                        ) : dataOthers?.data?.popular?.length > 0 ? (
                            <Carousel
                                data={dataOthers?.data?.popular}
                                renderItem={renderCarousel}
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
		return <View style={{height:'100%',paddingVertical:15}}><Skeleton type="article" /></View>
	}

    const handleReload=React.useCallback(()=>{
        setLoading(true);
        captchaRef.current.getToken()
        .then((recaptcha)=>{
            return PNpost(`/twitter/reload`,{id:slug,recaptcha})
        })
        .then(res=>{
            if(!res.error) {
                const aa = data.tweets
                const b = aa.concat(res.data)
                mutate({
                    ...data,
                    tweets:b
                })
            }
        }).finally(()=>{
            setLoading(false)
        })
    },[PNpost,slug])

    const handleDelete=React.useCallback(()=>{
        if(user?.admin===true) {
            setLoading(true)
            captchaRef.current.getToken()
            .then((recaptcha)=>{
                return PNpost(`/twitter/delete`,{id:slug,recaptcha})
            })
           .then(res=>{
                console.log(res);
                if(!res.error) {
                    setNotif(false,"Success",res?.msg);
                    navigation?.goBack();
                }
            }).finally(()=>{
                setLoading(false)
                captchaRef.current?.refreshToken();
            })
        }
    },[user,PNpost,slug,navigation])

    const handleDeleteTweet=React.useCallback((index)=>{
        if(user?.admin===true) {
            setLoading(true)
            captchaRef.current.getToken()
            .then((recaptcha)=>{
                return PNpost(`/twitter/delete_tweet`,{id:slug,index,recaptcha})
            })
            .then(res=>{
                if(!res.error) {
                    setNotif(false,"Success",res?.msg);
                    const aa = data?.tweets
                    aa.splice(index,1)
                    mutate({
                        ...data,
                        tweets:aa
                    })
                }
            }).finally(()=>{
                setLoading(false)
                captchaRef.current?.refreshToken();
            })
        }
    },[user,PNpost,slug])

    const renderItem=React.useCallback(({item,index})=>(
        <RenderTwitter index={index} item={item} setMenu={setMenu} />
    ),[])

    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{data && !data?.error && setOpen(true)}} />,[data]);

    return (
        <>
        <Layout navigation={navigation} title={"Twitter Thread Reader"} subtitle={data?.screen_name ? `Thread by @${data?.screen_name}` : undefined} menu={menuToggle}>
            <Animated.FlatList
                ListEmptyComponent={renderEmpty}
                ListHeaderComponentStyle={{
                    flexGrow: 1,
                    paddingTop:containerPaddingTop,
                }}
                scrollIndicatorInsets={{top:scrollIndicatorInsetTop}}
                refreshControl={
                    <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={containerPaddingTop} refreshing={refreshing} onRefresh={onRefresh}/>
                }
                data={data ? data?.tweets : []}
                ListHeaderComponent={HeaderComp}
                renderItem={renderItem}
                keyExtractor={(item, index) => 'twitter-thread-'+index}
                ListFooterComponent={RenderFooter}
                onScroll={onScroll}
            />
        </Layout>
        <Recaptcha ref={captchaRef} />
        {data && !data?.error && (
                <>
                    <MenuContainer
                        key="menu-1"
                        visible={open}
                        handleOpen={()=>setOpen(true)}
                        handleClose={()=>setOpen(false)}
                        onClose={()=>setOpen(false)}
                        type="twitter_thread"
                        item_id={data?.tweet_id}
                        share={{
                            link:`/twitter/thread/${data?.id}?utm_campaign=twitter_thread`,
                            title:`${Ktruncate(specialHTML(data?.tweets?.[0]?.tweet),150)} - Portalnesia`,
                            dialog:i18n.t('share_type',{type:i18n.t('twitter_thread')})
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
                    <MenuContainer
                        visible={menu!==null && !loading}
                        handleOpen={()=>setMenu(menu)}
                        handleClose={()=>setMenu(null)}
                        onClose={()=>setMenu(null)}
                        menu={[
                            {
                                title:`${i18n.t('copy')} ${i18n.t('text').toLowerCase()}`,
                                onPress:()=>{
                                    copyText(specialHTML(data?.tweets?.[menu]?.tweet),"Text")
                                    setMenu(null)
                                },
                                icon:"copy"
                            }
                            ,...(user?.admin ? [{
                                title:`${i18n.t('remove_type',{type:"tweet"})}`,
                                onPress:()=>handleDeleteTweet(menu),
                                icon:"trash",
                                color:theme['color-danger-500']
                            }] : [])
                        ]}
                    />
                </>
            )}
        </>
    )
}