import React from 'react'
import {View,Dimensions,Animated,RefreshControl,Alert} from 'react-native'
import {Layout as Lay,Text,useTheme,TopNavigation,TopNavigationAction,Icon,Divider,Menu,MenuItem} from '@ui-kitten/components'
import {TabView,TabBar,SceneMap} from 'react-native-tab-view'
import {useNavigationState} from '@react-navigation/native'
import {Modalize} from 'react-native-modalize'
import Skltn from 'react-native-skeleton-placeholder'
import Modal from 'react-native-modal'

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image,{ImageFull} from '@pn/components/global/Image'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'
import {TabBarHeight,HeaderHeight} from './utils'

import RenderFollow from './Follow'
import RenderAbout from './About'
import RenderMedia from './Media'
import { ForceTouchGestureHandler } from 'react-native-gesture-handler'

const user=false;

const {height:winHeight,width:winWidth} = Dimensions.get('window');
const {event,Value,createAnimatedComponent} = Animated

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
    return (
        <TopNavigationAction icon={BackIcon} onPress={() => {{
            if(index > 0) {
                navigation.goBack();
            } else {
                navigation.reset({
                    index:0,
                    routes:[{name:"Main",screen:"MainTabs"}]
                })
            }
        }}} />
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
    const scrollY = React.useRef(new Value(0)).current;
    const theme=useTheme();
    const {username,slug}=route.params;
    const {data,error,mutate,isValidating}=useSWR(`/user/${username}`,{},user)
    const [openMenu,setOpenMenu]=React.useState(false)
    //const data=undefined,error=undefined;
    const [tabIndex,setTabIndex] = React.useState(()=>{
        if(slug) {
            const index = tabIndexArray.findIndex((val)=>val == slug);
            if(index !== -1) return index;
        }
        return 0;
    });
    const [routes]=React.useState([
        {key:'about',title:"About"},
        {key:'follower',title:"Follower"},
        {key:'following',title:"Following"},
        {key:'media',title:"Media"}
    ])

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
                    accessoryRight={()=><MenuToggle onPress={()=>{setOpenMenu(true)}} />}
                />
            </View>
        )
    }

    const renderTabBar=(props)=>{
        const translateY = scrollY.interpolate({
            inputRange:[0,HeaderHeight],
            outputRange:[0,-(HeaderHeight)],
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
                            <View>
                                {data?.users?.image && <Image source={{uri:`${data?.users?.image}&size=100&watermark=no`}} dataSrc={{uri:`${data?.users?.image}&watermark=no`}} style={{height:100,width:100,borderRadius:50}} fancybox />}
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-start'}}>
                                <Button style={{marginRight:10}}>Follow</Button>
                                <Button accessoryLeft={MsgIcon} status="basic" appearance="ghost" />
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
        if(route.key == 'follower') return <RenderFollow type="follower" {...props} ref={ref.follower} onOpen={handleOpenMenu('follower')} />
        if(route.key == 'following') return <RenderFollow type="following" {...props} ref={ref.following} onOpen={handleOpenMenu('following')} />
        if(route.key == 'media') return <RenderMedia {...props} ref={ref.media} onOpen={handleOpenMenu('media')} />
        if(route.key == 'about') return <RenderAbout {...props} mutate={mutate} isValidating={isValidating} />
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
        console.log(tipe,data)
        setOpen({modal:tipe,...data})
        if(tipe !== 'media') setTimeout(ref.modal?.current?.open,100)
    }
    
    const handleCloseMenu=()=>{
        setOpen(null)
    }

    return (
        <>
            <Layout navigation={navigation} whiteBg>
                {renderNavbar()}
                {renderTabView()}
            </Layout>
            <Modalize
                ref={ref.modal}
                withHandle={false}
                modalStyle={{
                    backgroundColor:theme['background-basic-color-1'],
                }}
                adjustToContentHeight
                onClosed={handleCloseMenu}
            >
                <Lay style={{borderTopLeftRadius:20,borderTopRightRadius:20}}>
                    <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
                        <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
                    </View>
                    <Lay style={{marginBottom:10}}>
                        <Menu appearance="noDivider">
                            <MenuItem title="Follow" />
                            <MenuItem title="Report" />
                        </Menu>
                    </Lay>
                </Lay>
            </Modalize>
            <Modal
                isVisible={open?.modal==='media'}
                style={{margin:0,justifyContent:'center'}}
                onBackdropPress={()=>setOpen(null)}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <Lay style={{maxWidth:winWidth-20,margin:10,paddingVertical:20,paddingHorizontal:10,borderRadius:10}}>
                    {open!==null ? (
                        <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                            <ImageFull contentWidth={winWidth-40} source={{uri:`${open.src}&watermark=no`}} thumbnail={{uri:`${open.src}&size=50`}} />
                            <Text style={{marginTop:10}}>{open?.title}</Text>
                        </View>
                    ) : null}
                </Lay>
            </Modal>
            {data && (
                <MenuContainer
                    visible={openMenu}
                    handleOpen={()=>setOpenMenu(true)}
                    handleClose={()=>setOpenMenu(false)}
                    onClose={()=>setOpenMenu(false)}
                    share={{
                        link:`/user/${data?.users?.username}?utm_campaign=user`,
                        title:`${data?.users?.name} (@${data?.users?.username}) - Portalnesia`
                    }}
                    menu={[{
                        action:"share",
                        title:"Share",
                    },{
                        title:"Copy link",
                        action:'copy'
                    },{
                        title:"Open in browser",
                        action:'browser'
                    }]}
                />
            )}
        </>
    )
}