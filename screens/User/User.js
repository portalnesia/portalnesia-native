import React from 'react'
import {View,Dimensions,Animated,RefreshControl,Alert} from 'react-native'
import {Layout as Lay,Text,useTheme,TopNavigation,Icon,Divider,Menu,MenuItem} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'
import {useNavigationState} from '@react-navigation/native'
import {Modalize} from 'react-native-modalize'
import Skltn from 'react-native-skeleton-placeholder'
import Modal from 'react-native-modal'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import {resetRoot} from '@pn/navigation/useRootNavigation'

import Pressable from "@pn/components/global/Pressable";
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image,{ImageFull} from '@pn/components/global/Image'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'
import Avatar from '@pn/components/global/Avatar'
import {TabBarHeight,HeaderHeight} from './utils'
import Brightness from '@pn/module/Brightness'
import TopNavigationAction from '@pn/components/navigation/TopAction'

import RenderFollow from './Follow'
import RenderAbout from './About'
import RenderMedia from './Media'
import { AuthContext } from '@pn/provider/Context'
import { CONTENT_URL,URL } from '@env'
import { ucwords } from '@pn/utils/Main'
import useAPI from '@pn/utils/API'
import downloadFile from '@pn/utils/Download'
import { Portal } from '@gorhom/portal'
import useSelector from '@pn/provider/actions'

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

const RenderBackButton=React.memo(({navigation})=>{
    const index = useNavigationState(state=>state.index);
    const handleBack=React.useCallback(()=>{
        if(navigation?.canGoBack() && index > 0) {
            navigation.goBack();
        } else {
            resetRoot();
        }
},[navigation,index])
    return (
        <TopNavigationAction icon={BackIcon} onPress={handleBack} tooltip={i18n.t('back')} />
    )
})

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
    //const swrEdit = useSWR(user && user?.id == username ? `/user/${username}/edit` : null);
    const [openMenu,setOpenMenu]=React.useState(false)
    const [refreshing,setRefreshing]=React.useState(false)
    const [loading,setLoading]=React.useState(false);
	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])
    const handleRefreshing=()=>{
        if(!isValidating) {
            setRefreshing(true);
            mutate();
        }
    }
    //React.useEffect(()=>console.log(data?.users?.id,user.id),[data,user]);
    //const data=undefined,error=undefined;
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
    let isListGliding = React.useRef(false);

    const [open,setOpen]=React.useState(null)

    const ref={
        following:React.useRef(null),
        follower:React.useRef(null),
        media:React.useRef(null),
        modal:React.useRef(null),
        scroll:React.useRef(null)
    }

    React.useEffect(()=>{
        scrollY.addListener(({value})=>{
            const curRoute = routes[tabIndex].key;
            listOffset.current[curRoute] = value
        })
        return ()=>scrollY.removeAllListeners();
    },[routes,tabIndex])

    const syncScrollOffset=()=>{
        const curRouteKey = routes[tabIndex].key
        /*const curRef = listRefArr.current.find(e=>e.key===curRouteKey);
        if(curRef && curRef?.value) {
            const y = scrollY._value;
            const snapToEdgeThreshold = HeaderHeight / 2;
            if (y < snapToEdgeThreshold) {
                curRef?.value?.scrollTo ? curRef?.value?.scrollTo({x:0,y:0})
                : curRef?.value?.scrollToOffset ? curRef?.value?.scrollToOffset({offset:0})
                : undefined;
            }
            if (y >= snapToEdgeThreshold && y < HeaderHeight) {
                curRef?.value?.scrollTo ? curRef?.value?.scrollTo({x:0,y:HeaderHeight+10})
                    : curRef?.value?.scrollToOffset ? curRef?.value?.scrollToOffset({offset:HeaderHeight+10})
                    : undefined;
            }
        }*/

        listRefArr.current.filter(e=>e.value!==undefined).forEach((item)=>{
            if(item.key !== curRouteKey) {
                if(scrollY?._value < HeaderHeight && scrollY?._value >= 0) {
                    item?.value?.scrollTo ? item?.value?.scrollTo({x:0,y:scrollY._value,animated:false})
                    : item?.value?.scrollToOffset ? item?.value?.scrollToOffset({offset:scrollY._value,animated:false})
                    : undefined;
                    listOffset.current[item.key] = scrollY._value;
                } else if(scrollY?._value >= HeaderHeight) {
                    if(
                        listOffset.current[item.key] < HeaderHeight ||
                        listOffset.current[item.key] == null
                    ) {
                        item?.value?.scrollTo ? item?.value?.scrollTo({x:0,y:HeaderHeight,animated:false})
                        : item?.value?.scrollToOffset ? item?.value?.scrollToOffset({offset:HeaderHeight,animated:false})
                        : undefined;
                        listOffset.current[item.key] = HeaderHeight;
                    }
                }
            }
        })
    }

    const handleFollow=()=>{
        if(!loading) {
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
        }
    }

    const onMomentumScrollBegin=()=>{
        isListGliding.current = true;
    }
    const onMomentumScrollEnd=()=>{
        isListGliding.current = false;
        syncScrollOffset();
    }
    const onScrollEndDrag = ()=>{
        syncScrollOffset();
    }

    const renderNavbar=()=>{
        const opacity = scrollY.interpolate({
            inputRange:[0,200,250],
            outputRange:[0,0,1],
            extrapolate:'clamp'
        })
    
        return (
            <View style={{position:'absolute',top:0,width:'100%',zIndex:1}}>
                <TopNavigation
                    title={(evaProps) => <AnimText {...evaProps}  category="h1" style={{...evaProps?.style,marginHorizontal:50,opacity}} numberOfLines={1}>{data?.users?.username||""}</AnimText>}
                    accessoryLeft={()=><RenderBackButton navigation={navigation} />}
                    alignment="center"
                    accessoryRight={()=><MenuToggle onPress={()=>{data && !data?.error && setOpenMenu(true)}} />}
                />
            </View>
        )
    }

    const renderTabBar=(props)=>{
        const translateY = scrollY.interpolate({
            inputRange:[0,HeaderHeight],
            outputRange:[0,-(HeaderHeight+1)],
            extrapolateRight:'clamp',
            extrapolateLeft:'clamp',
            extrapolate:'clamp'
        })
        return (
            <Animated.View testID="Header-Test" style={{zIndex:1,top:56,left: 0,right: 0,position:'absolute',width:'100%',transform:[{translateY}]}}>
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
                                    <Button style={{marginRight:10}} onPress={()=>navigation?.navigate("MainStack",{screen:"EditUserScreen"})}>{`Edit ${i18n.t('profile')}`}</Button>
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
                        <Text style={{fontSize:15}}>{`@${data?.users?.username}`}</Text>
                    </Lay>
                )}
                <TabBar
                    {...props}
                    onTabPress={({route,preventDefault})=>{
                        if(isListGliding.current) preventDefault();
                    }}
                    style={{height:56,elevation:0,shadowOpacity:0,backgroundColor:theme['background-basic-color-1']}}
                    indicatorStyle={{backgroundColor:theme['color-indicator-bar'],height:3}}
                    renderLabel={({route,focused})=>{
                        return <Text appearance={focused ? 'default' : 'hint'}>{route.title||""}</Text>
                    }}
                    pressColor={theme['color-control-transparent-disabled']}
                    pressOpacity={0.8}
                />
            </Animated.View>
        )
    }

    const onGetRef=route=>(ref)=>{
        if(ref) {
            const found = listRefArr.current.findIndex((e)=>e.key === route.key);
            if(found !== -1) {
                listRefArr.current[found].value = ref
            }
        }
    }

    const renderScene=({route})=>{
        const props={
            data,
            error,
            scrollY,
            onMomentumScrollBegin,
            onMomentumScrollEnd,
            onScrollEndDrag,
            onGetRef:onGetRef(route)
        }
        if(route.key == 'follower') return <RenderFollow type="follower" {...props} ref={ref.follower} />
        if(route.key == 'following') return <RenderFollow type="following" {...props} ref={ref.following} />
        if(route.key == 'media') return <RenderMedia {...props} ref={ref.media} onOpen={handleOpenMenu('media')} />
        if(route.key == 'about') return <RenderAbout {...props} mutate={handleRefreshing} isValidating={refreshing} />
        return null;
    }

    const renderTabView=()=>{
        return (
            <TabView
                onIndexChange={(index)=>setTabIndex(index)}
                navigationState={{index:tabIndex,routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                initialLayout={{height:0,width:winWidth}}
                lazy
            />
        )
    }

    const handleOpenMenu=(tipe)=>(data)=>{
        setOpen({modal:tipe,...data})
        if(tipe==='qrcode') {
            Brightness.setBrightness(0.8);
        }
    }
    
    const handleCloseMenu=async()=>{
        setOpen(null)
        const system = await Brightness.getSystemBrightness();
        const brightness = system*1/16;
        await Brightness.setBrightness(brightness)
    }

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
            const down = await downloadFile(url,filename,`pn://user/${data?.users?.username}`,`pn://second-screen?type=open_file&file=${encodeURIComponent(filename)}&mime=${encodeURIComponent('image/png')}`)
            if(down) {
                await handleCloseMenu();
                setNotif(false,"Download","Start downloading...");
                await down.start();
            }
        } catch(err) {
            setNotif(true,"Error",err?.message||"Something went wrong");
        }

    },[data,setNotif,handleCloseMenu])

    return (
        <>
            <Layout navigation={navigation} whiteBg>
                {renderNavbar()}
                {renderTabView()}
            </Layout>
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
                            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                <ImageFull contentWidth={winWidth-40} source={{uri:`${open.src}&watermark=no`}} thumbnail={{uri:`${open.src}&size=50`}} />
                                <Text style={{marginTop:10}}>{open?.title}</Text>
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