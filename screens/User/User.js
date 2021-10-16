import React from 'react'
import {View,Dimensions,Animated} from 'react-native'
import {Layout as Lay,Text,useTheme,TopNavigation,Icon} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'
import {useNavigationState} from '@react-navigation/native'
import {Modalize} from 'react-native-modalize'
import Skltn from 'react-native-skeleton-placeholder'
import Modal from 'react-native-modal'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import {PanGestureHandler,State} from 'react-native-gesture-handler'
import Reanimated from 'react-native-reanimated'

import {linkTo} from '@pn/navigation/useRootNavigation'
import Pressable from "@pn/components/global/Pressable";
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image,{ImageFull} from '@pn/components/global/Image'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'
import Avatar from '@pn/components/global/Avatar'
import {TabBarHeight,HeaderHeight} from './utils'
import Portalnesia from '@portalnesia/react-native-core'
import TopNavigationAction from '@pn/components/navigation/TopAction'
import Authentication from '@pn/module/Authentication'
import Recaptcha from '@pn/components/global/Recaptcha'

import RenderFollow from './Follow'
import RenderAbout from './About'
import RenderMedia from './Media'
import { AuthContext } from '@pn/provider/Context'
import { CONTENT_URL,URL } from '@env'
import { ucwords } from '@portalnesia/utils'
import useAPI from '@pn/utils/API'
import downloadFile from '@pn/utils/Download'
import { Portal } from '@gorhom/portal'
import useSelector from '@pn/provider/actions'
import {getCollapsOpt} from '@pn/utils/Main'
import {useCollapsibleHeader} from 'react-navigation-collapsible'

const {height:winHeight,width:winWidth} = Dimensions.get('window');
const {Value,createAnimatedComponent} = Animated

const AnimText = createAnimatedComponent(Text);
const AnimImage = createAnimatedComponent(Image)

const BackIcon=(props)=>(
	<Icon {...props} name='arrow-back' />
)
const MsgIcon=(props)=>(
	<Icon {...props} name='message-square-outline' />
)

const SkeletonHeader=()=>{
    const theme=useTheme();
    return (
        <Skltn height={240} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Skltn.Item paddingHorizontal={15} paddingTop={70} justifyContent="flex-end" flexDirection="column">
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View>
                        <View style={{height:100,width:100,borderRadius:50}} />
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-start',flexGrow:1}}>
                        <Skltn.Item height={30} width={(winWidth/2)/2} marginRight={10} borderRadius={5} />
                        <Skltn.Item height={30} width={30} borderRadius={5} />
                    </View>
                </View>
                <Skltn.Item alignItems="flex-start">
                    <View style={{height:25,width:winWidth/2,marginTop:15,borderRadius:5}} />
                    <View  style={{height:15,width:winWidth/4,marginTop:5,borderRadius:5}} />
                </Skltn.Item>
            </Skltn.Item>
        </Skltn>
    )
}



const tabIndexArray=['about','follower','following','media'];
const panRef = React.createRef();
export default function UserScreen({navigation,route}){
    const {user,lang} = useSelector(state=>({user:state.user,lang:state.lang}))
    const context = React.useContext(AuthContext)
    const {setNotif}=context
    const {PNpost} = useAPI()
    const [ready,setReady]=React.useState(false)
    const scrollY = React.useRef(new Value(0)).current;
    const theme=useTheme();
    const {username,slug}=route.params;
    const {data,error,mutate,isValidating}=useSWR(`/user/${username}`,{},true);
    const [openMenu,setOpenMenu]=React.useState(false)
    const [refreshing,setRefreshing]=React.useState(false)
    const [loading,setLoading]=React.useState(false);
    const captchaRef = React.useRef(null);
	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])
    const handleRefreshing=()=>{
        if(!isValidating) {
            setRefreshing(true);
            mutate();
        }
    }
    const [tabIndex,setTabIndex] = React.useState(()=>{
        if(slug) {
            const index = tabIndexArray.findIndex((val)=>val == slug);
            if(index !== -1) return index;
        }
        return 0;
    });
    const routes=React.useMemo(()=>([
        {key:'about',title:ucwords(i18n.t("form.about"))},
        {key:'follower',title:ucwords(i18n.t("follower"))},
        {key:'following',title:ucwords(i18n.t("following"))},
        {key:'media',title:"Media"}
    ]),[lang])

    let listRefArr=React.useRef([
        {key:'about',value:undefined},
        {key:'follower',value:undefined},
        {key:'following',value:undefined},
        {key:'media',value:undefined}
    ]);
    let listOffset=React.useRef({});

    const collapsOpt = React.useMemo(()=>{
        return getCollapsOpt(theme,false);
    },[theme])
    const {onScrollWithListener,containerPaddingTop,scrollIndicatorInsetTop} = useCollapsibleHeader({
        ...collapsOpt,
        config:{
            ...collapsOpt.config,
            disabled:true,
            useNativeDriver:true
        }
    },false)

    const onScroll = onScrollWithListener((e)=>{
        scrollY.setValue(e?.nativeEvent?.contentOffset?.y);
    })

    const [open,setOpen]=React.useState(null)

    React.useEffect(()=>{
        scrollY.addListener(({value})=>{
            const curRoute = routes[tabIndex].key;
            listOffset.current[curRoute] = value
        })
        return ()=>scrollY.removeAllListeners();
    },[routes,tabIndex])

    const handleFollow=()=>{
        if(!loading) {
            if(user) {
                setLoading(true);
                PNpost(`/backend/follow`,{token:data?.users?.token_follow}).then((res)=>{
                    if(!res.error){
                        setNotif(false,"Success!",res?.msg);
                        mutate({
                            ...data,
                            users:{
                                ...data.users,
                                isFollowing:res.follow,
                                isPending:res.pending,
                                token_follow:res.new_token
                            }
                        })
                    }
                })
                .finally(()=>{
                    setLoading(false)
                })
            } else {
                Authentication.startAuthActivity();
            }
        }
    }

    const opacity = scrollY.interpolate({
        inputRange:[0,200,250],
        outputRange:[0,0,1],
        extrapolate:'clamp'
    })

    const translateY = scrollY.interpolate({
        inputRange:[0,HeaderHeight],
        outputRange:[0,-(HeaderHeight+1)],
        extrapolateRight:'clamp',
        extrapolateLeft:'clamp',
        extrapolate:'clamp'
    })
    const panGestureY = React.useRef(new Animated.Value(0)).current;

    const onScrollEndDrag=()=>{
        const aa = translateY.__getValue();
        panGestureY.setValue(-aa)
    }

    const onGestureEnd=()=>{
        const aa = translateY.__getValue();
        panGestureY.setValue(-aa)
    }

    const onGestureHandle=(e)=>{
        const ref = listRefArr.current[tabIndex].value;
        if(tabIndex === 0) {
            if(ref) ref.scrollTo({animated:false,x:0,y: panGestureY._value + (-(e?.nativeEvent?.translationY))});
        } else {
            if(ref) ref.scrollToOffset({offset:panGestureY._value + (-(e?.nativeEvent?.translationY)),animated:false});
        }
    }

    const onTabPress=React.useCallback((scene)=>{
        const found = listRefArr.current.findIndex((e)=>e.key === scene.route.key);
        if(found !== -1) {
            const ref = listRefArr.current[found].value;
            if(ref) {
                Animated.spring(scrollY,{
                    toValue:0,
                    useNativeDriver:true
                }).start(()=>{
                    panGestureY.setValue(0)
                });
                if(found === 0) ref.scrollTo({animated:true,x:0,y:0})
                else ref.scrollToOffset({offset:0,animated:true})
            }
        }
    },[])

    const renderTabBar=React.useCallback((props)=>{

        return (
            <Animated.View testID="Header-Test" style={{zIndex:1,position:'absolute',width:'100%',transform:[{translateY}]}}>
                <PanGestureHandler
                    enabled
                    ref={panRef}
                    onGestureEvent={onGestureHandle}
                    onEnded={onGestureEnd}
                >
                    <View>
                        {(!data && !error) || (data?.error || error) ? (
                            <SkeletonHeader />
                        ) : (
                            <Lay style={{paddingHorizontal:15,height:HeaderHeight,justifyContent:'flex-end',flex:1,paddingBottom:10}}>
                                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                    {typeof data?.users?.image !== 'undefined' && (
                                        <Lay>
                                            <Lay style={{flexDirection:'row',justifyContent:'center',position:'relative'}}>
                                                {data?.users?.image !== null ? (
                                                    <Image source={{uri:`${data?.users?.image}&size=100&watermark=no`}} dataSrc={{uri:`${data?.users?.image}&watermark=no`}} style={{height:100,width:100,borderRadius:50}} fancybox />
                                                ) : (
                                                    <Avatar name={ucwords(data?.users?.name)} size={100} />
                                                )}
                                                <View style={{backgroundColor:theme['color-danger-600'],height:40,width:40,borderRadius:30,position:'absolute',top:60,left:60,flexDirection:'row',justifyContent:'center',alignItems:'center',overflow:'hidden'}}>
                                                    <Pressable tooltip="QR Code" style={{padding:8}} onPress={()=>handleOpenMenu('qrcode')({})}>
                                                        <Icon name="qr-code" style={{width:24,height:24,tintColor:'#fff'}} pack="material" />
                                                    </Pressable>
                                                </View>
                                            </Lay>
                                        </Lay>
                                    )}
                                    <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-start'}}>
                                        {user && user?.id == data?.users?.id ? (
                                            <Button style={{marginRight:10}} onPress={()=>linkTo(`/user/${data?.users?.username}/edit`)}>{`Edit ${i18n.t('profile')}`}</Button>
                                        ) : (
                                            <>
                                                <Button
                                                    onPress={handleFollow}
                                                    style={{marginRight:10}}
                                                    status={data?.users?.isFollowing && !data?.users?.isPending ? 'danger' : !data?.users?.isFollowing && data?.users?.isPending ? 'basic' : 'primary'}
                                                    disabled={loading}
                                                    loading={loading}
                                                    tooltip={data?.users?.isFollowing && !data?.users?.isPending ? ucwords(i18n.t('unfollow')) : data?.users?.isPending ? `Pending` : ucwords(i18n.t('follow'))}
                                                >
                                                    {data?.users?.isFollowing && !data?.users?.isPending ? ucwords(i18n.t('unfollow')) : data?.users?.isPending ? `Pending` : ucwords(i18n.t('follow'))}
                                                </Button>
                                                <Button accessoryLeft={MsgIcon} text onPress={()=>setNotif(true,'Error','Under maintenance')} disabled={loading} tooltip={i18n.t('send_type',{type:i18n.t('form.message')})} />
                                            </>
                                        )}
                                        
                                    </View>
                                </View>
                                <Text style={{fontSize:30,marginTop:10,fontFamily:"Inter_Bold"}}>{data?.users?.name||""}</Text>
                                <View style={{flexDirection:"row",alignItems:"center"}}>
                                    <Text style={{fontSize:15,...(data?.users?.verify ? {marginRight:5} : {})}}>{`@${data?.users?.username}`}</Text>
                                    {data?.users?.verify && <Icon style={{height:15,width:15,tintColor:theme['color-indicator-bar']}} name="verified" pack="material" />}
                                </View>
                                
                            </Lay>
                        )}
                        
                    </View>
                </PanGestureHandler>
                <TabBar
                    {...props}
                    style={{height:56,elevation:1,backgroundColor:theme['background-basic-color-1']}}
                    indicatorStyle={{backgroundColor:theme['color-indicator-bar'],height:3}}
                    renderLabel={({route,focused})=>{
                        return <Text appearance={focused ? 'default' : 'hint'}>{route.title||""}</Text>
                    }}
                    pressColor={theme['color-control-transparent-disabled']}
                    pressOpacity={0.8}
                    onTabPress={onTabPress}
                />
            </Animated.View>
        )
    },[theme,route,data,loading,handleFollow,error,containerPaddingTop,onGestureHandle,navigation])

    const onGetRef=React.useCallback((route)=>(ref)=>{
        if(ref) {
            const found = listRefArr.current.findIndex((e)=>e.key === route.key);
            if(found !== -1) {
                listRefArr.current[found].value = ref
            }
        }
    },[])

    const renderScene=React.useCallback(({route})=>{
        const props={
            data,
            error,
            onScroll,
            containerPaddingTop,
            scrollIndicatorInsetTop,
            onScrollEndDrag,
            onGetRef:onGetRef(route)
        }
        if(route.key == 'follower') return <RenderFollow type="follower" {...props} />
        if(route.key == 'following') return <RenderFollow type="following" {...props} />
        if(route.key == 'media') return <RenderMedia {...props} onOpen={handleOpenMenu('media')} />
        if(route.key == 'about') return <RenderAbout {...props} mutate={handleRefreshing} isValidating={refreshing} />
        return null;
    },[data,error,onScroll,containerPaddingTop,scrollIndicatorInsetTop,onGetRef,handleRefreshing,refreshing,handleOpenMenu])

    const renderTabView=React.useCallback(()=>{
        return (
            <TabView
                onIndexChange={(index)=>{
                    setTabIndex(index)
                }}
                navigationState={{index:tabIndex,routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                initialLayout={{height:0,width:winWidth}}
                lazy
            />
        )
    },[tabIndex,routes,renderScene,renderTabBar])

    const handleOpenMenu=React.useCallback((tipe)=>(data)=>{
        setOpen({modal:tipe,...data})
        if(tipe==='qrcode') {
            Portalnesia.Brightness.setBrightness(0.8);
        }
    },[])
    
    const handleCloseMenu=React.useCallback(async()=>{
        setOpen(null)
        const system = await Portalnesia.Brightness.getSystemBrightness();
        await Portalnesia.Brightness.setBrightness(system)
    },[])

    React.useEffect(()=>{
        if(data && !data?.error && !ready) {
            (async function(){
                await analytics().logSelectContent({
                    content_type:'user',
                    item_id:String(data?.users?.id)
                })
                setReady(true)
            })()
        }
    },[data,username,ready,user])

    const handleDownloadQR=React.useCallback(async()=>{
        if(!data?.users?.username) return;

        const url = `${CONTENT_URL}/qr/user/${data?.users?.username}`;
        const filename = `[portalnesia.com]_${data?.users?.username}_QRcode.png`;

        try {
            const down = await downloadFile(url,filename,`pn://user/${data?.users?.username}`,`image/png`)
            if(down) {
                await handleCloseMenu();
                setNotif(false,"Download","Start downloading...");
                down.start();
            }
        } catch(err) {
            setNotif(true,"Error",err?.message||"Something went wrong");
        }

    },[data,setNotif,handleCloseMenu])

    const handleSetAsProfile=React.useCallback(async()=>{
        setLoading(true);
        let recaptcha="";
        try {
            try {
                recaptcha = await captchaRef.current?.getToken();
            } catch(e) {
                setNotif(true,"Error",e?.message||i18n.t("errors.general"));
            }
            const res = await PNpost(`/setting/change_profile`,{recaptcha,id:open?.id})
            if(!Boolean(res?.error)) {
                setNotif(false,res?.msg);
                mutate();
                setOpen(null)
                const system = await Portalnesia.Brightness.getSystemBrightness();
                await Portalnesia.Brightness.setBrightness(system)
            }
        } finally {
            setLoading(false)
        }
    },[PNpost,open,setNotif])

    const handleDownloadMedia=React.useCallback(()=>{
        handleCloseMenu();
        if(open?.token_download) {
            linkTo(`/download?token=${open?.token_download}`)
        } else {
            Authentication.startAuthActivity();
        }
    },[open])

    const renderTitle=React.useCallback(() => (
        <Animated.View style={{opacity,flexDirection:'row',alignItems:"center",marginHorizontal:50}}>
            <Text category="h1" style={{fontSize:18,...(data?.users?.verify ? {marginRight:5} : {})}} numberOfLines={1}>{data?.users?.username||""}</Text>
            {data?.users?.verify && <Icon style={{height:15,width:15,tintColor:theme['color-indicator-bar']}} name="verified" pack="material" />}
        </Animated.View>
    ),[data,theme])
    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{data && !data?.error && setOpenMenu(true)}} />,[data]);

    return (
        <>
            <Layout navigation={navigation} whiteBg title={renderTitle} menu={menuToggle}>
                {renderTabView()}
            </Layout>
            <Recaptcha ref={captchaRef} />
            <Portal>
                <Modal
                    isVisible={open !== null && ['media','qrcode'].indexOf(open?.modal) !== -1}
                    style={{margin:0,justifyContent:'center'}}
                    onBackdropPress={handleCloseMenu}
                    onBackButtonPress={handleCloseMenu}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    coverScreen={false}
                >
                    <Lay style={{maxWidth:winWidth-20,margin:10,paddingVertical:20,paddingHorizontal:10,borderRadius:10}}>
                        {open?.modal === 'qrcode' ? (
                            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                <ImageFull contentWidth={winWidth-40} source={{uri:`${CONTENT_URL}/qr/user/${data?.users?.username}`}} />
                                <View style={{marginTop:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                    <Button text onPress={handleDownloadQR}>Download</Button>
                                </View>
                            </View>
                        ) : open!==null ? (
                            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',width:'100%'}}>
                                <ImageFull contentWidth={winWidth-40} source={{uri:`${open.src}&watermark=no`}} thumbnail={{uri:`${open.src}&size=50`}} />
                                <Text style={{marginTop:10}}>{open?.title}</Text>
                                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                                    <Button text onPress={handleDownloadMedia}>Download</Button>
                                    {open?.can_set_profile && !open?.is_profile_picture ? <Button text onPress={handleSetAsProfile} disabled={loading} loading={loading}>Set as Profile Picture</Button> : null }
                                </View>
                            </View>
                        ) : null}
                    </Lay>
                </Modal>
            </Portal>
            {data && (
                <MenuContainer
                    visible={openMenu}
                    handleOpen={()=>setOpenMenu(true)}
                    handleClose={()=>setOpenMenu(false)}
                    onClose={()=>setOpenMenu(false)}
                    type="user"
                    item_id={data?.users?.id}
                    share={{
                        link:`/user/${data?.users?.username}?utm_campaign=user`,
                        title:`${data?.users?.name} (@${data?.users?.username}) - Portalnesia`
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
        </>
    )
}