import React from 'react'
import {View,Dimensions,Animated,RefreshControl,Alert} from 'react-native'
import {Layout as Lay,Text,useTheme,TopNavigation,TopNavigationAction,Icon,Divider,Menu,MenuItem,Tab,TabBar,ViewPager} from '@ui-kitten/components'
import Header from 'react-native-sticky-parallax-header'
import {useNavigationState} from '@react-navigation/native'
import {Modalize} from 'react-native-modalize'
import Skltn from 'react-native-skeleton-placeholder'
import Modal from 'react-native-modal'

import Layout from '@pn/components/global/Layout';
import Image,{ImageFull} from '@pn/components/global/Image'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'

import RenderFollow from './Follow'
import RenderAbout from './About'
import RenderMedia from './Media'

const user=false;

const {height:winHeight,width:winWidth} = Dimensions.get('window');
const {event,Value,createAnimatedComponent} = Animated
const scrollY = new Value(0);

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
        <Lay style={{paddingHorizontal:15,paddingTop:60,paddingBottom:30}}>
            <Skltn backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View>
                        <View style={{height:100,width:100,borderRadius:50}} />
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-start'}}>
                        <Skltn.Item height={30} width={(winWidth/2)/2} marginRight={10} borderRadius={5} />
                        <Skltn.Item height={30} width={30} borderRadius={5} />
                    </View>
                </View>
                <View style={{height:25,width:winWidth/2,marginTop:15,borderRadius:5}} />
                <View  style={{height:15,width:winWidth/4,marginTop:5,borderRadius:5}} />
            </Skltn>
        </Lay>
    )
}

const tabIndexArray=['about','follower','following','media'];
export default function UserScreen({navigation,route}){
    const theme=useTheme();
    const {username,slug}=route.params;
    const {data,error,mutate,isValidating:aboutValidating}=useSWR(`/user/${username}`,{},user)
    const [tabIndex,setTabIndex] = React.useState(()=>{
        if(slug) {
            const index = tabIndexArray.findIndex((val)=>val == slug);
            if(index !== -1) return index;
        }
        return 0;
    });
    const [open,setOpen]=React.useState(null)
    const indexName=tabIndexArray[tabIndex]
    const [refreshing,setRefreshing] = React.useState(false);

    const ref={
        following:React.useRef(null),
        follower:React.useRef(null),
        media:React.useRef(null),
        modal:React.useRef(null),
        scroll:React.useRef(null)
    }

    const renderNavbar=()=>{
        const opacity = scrollY.interpolate({
            inputRange:[0,130,180],
            outputRange:[0,0,1],
            extrapolate:'clamp'
        })
    
        return (
            <TopNavigation
                title={(evaProps) => <AnimText {...evaProps}  category="h1" style={{...evaProps?.style,marginHorizontal:50,opacity}} numberOfLines={1}>{data?.users?.username||""}</AnimText>}
                accessoryLeft={()=><RenderBackButton navigation={navigation} />}
                alignment="center"
            />
        )
    }

    const RenderHeader=()=>{
        if((!data && !error) || (data?.error || error)) return <SkeletonHeader />

        const opacityText = scrollY.interpolate({
            inputRange:[0,76,164],
            outputRange:[1,1,0],
            extrapolate:'clamp'
        })

        const opacityImage = scrollY.interpolate({
            inputRange:[0,40,120],
            outputRange:[1,1,0],
            extrapolate:'clamp'
        })

        const imageSize = scrollY.interpolate({
            inputRange:[0,40,150],
            outputRange:[100,100,40],
            extrapolate:'clamp'
        })

        return (
            <Lay style={{paddingHorizontal:15,justifyContent:'flex-end',flex:1,paddingBottom:30}}>
                <Animated.View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',opacity:opacityImage}}>
                    <View>
                    {data?.users?.image && <AnimImage source={{uri:`${data?.users?.image}&size=100&watermark=no`}} dataSrc={{uri:`${data?.users?.image}&watermark=no`}} style={{height:imageSize,width:imageSize,borderRadius:50,opacity:opacityImage}} fancybox />}
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-start'}}>
                        <Button style={{marginRight:10}}>Follow</Button>
                        <Button accessoryLeft={MsgIcon} status="basic" appearance="ghost" />
                    </View>
                </Animated.View>
                <AnimText style={{fontSize:30,marginTop:10,fontFamily:"Inter_Bold",opacity:opacityText}}>{data?.users?.name||""}</AnimText>
                <AnimText style={{fontSize:15,opacity:opacityText}}>{`@${data?.users?.username}`}</AnimText>
            </Lay>
        )
    }

    const onChangeTab=({i})=>{
        setTabIndex(i)
        setRefreshing(false);
    }

    const onEndReach=()=>{
        if(indexName !== 'about') {
            ref?.[indexName]?.current?.loadMore();
        }
    }

    const onRefresh=()=>{
        if(indexName === 'about') mutate()
        else ref?.[indexName]?.current?.refresh();
    }

    const handleOpenMenu=(tipe)=>(data)=>{
        console.log(tipe,data)
        setOpen({modal:tipe,...data})
        if(tipe !== 'media') setTimeout(ref.modal?.current?.open,100)
    }

    const handleCloseMenu=()=>{
        setOpen(null)
    }

    const onValidating=(tipe)=>(val)=>{
        if(tipe == indexName) setRefreshing(val)
    }

    React.useEffect(()=>{
        if(indexName == 'about' && data) setRefreshing(aboutValidating)
    },[aboutValidating,data])

    React.useEffect(()=>{
        if(data?.error || error) {
            Alert.alert(
                "Ooopss",
                data?.msg||error?.message||"Something went wrong",
                [{
                    text:"OK",
                    onPress:()=>navigation.goBack()
                }]
            )
        }
    },[data,error])

    /*React.useEffect(()=>{
        scrollY.addListener(({value})=>scrollYRef.current=value)
        return ()=>scrollY.removeAllListeners();
    },[])*/
    
    return (
        <>
            <Layout navigation={navigation}>
            <Header
                    backgroundColor={theme['background-basic-color-1']}
                    header={renderNavbar()}
                    keyboardShouldPersistTaps="handled"
                    headerHeight={56}
                    bounces={false}
                    snapToEdge={true}
                    foreground={<RenderHeader />}
                    parallaxHeight={250}
                    headerSize={()=>{}}
                    tabsContainerBackgroundColor={theme['background-basic-color-1']}
                    tabTextStyle={{fontSize:16,lineHeight:20,color:theme['text-basic-color']}}
                    tabTextContainerStyle={{backgroundColor:'transparent',borderRadius:18,paddingHorizontal:12,paddingVertical:8,marginHorizontal:5}}
                    tabTextContainerActiveStyle={{backgroundColor:theme['background-basic-color-3']}}
                    tabsContainerStyle={{borderBottomColor:theme['border-basic-color'],borderBottomWidth:2}}
                    contentContainerStyles={{backgroundColor:theme['background-basic-color-2'],flexGrow:1}}
                    tabWrapperStyle={{paddingBottom:10}}
                    onChangeTab={onChangeTab}
                    initialPage={tabIndex}
                    onEndReached={onEndReach}
                    //scrollRef={ref.scroll}
                    refreshControl={
                        <RefreshControl
                            style={{zIndex:1}}
                            colors={['white']}
                            progressBackgroundColor="#2f6f4e"
                            refreshing={refreshing}
                            title="Refreshing"
                            onRefresh={onRefresh}
                        />
                    }
                    tabs={[
                        {
                            title:"About",
                            content:<RenderAbout data={data} error={error} />
                        },
                        {
                            title:"Follower",
                            content:<RenderFollow type="follower" ref={ref.follower} data={data} error={error} onValidatingChange={onValidating('follower')}  />
                        },
                        {
                            title:"Following",
                            content:<RenderFollow type="following" ref={ref.following} data={data} error={error} onValidatingChange={onValidating('following')}  />
                        },
                        {
                            title:"Media",
                            content:<RenderMedia data={data} error={error} ref={ref.media} onValidatingChange={onValidating('media')} onOpen={handleOpenMenu('media')} />
                        }
                    ]}
                    scrollEvent={event(
                        [{nativeEvent:{contentOffset:{y:scrollY}}}],
                        {useNativeDriver:false}
                    )}
                />
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
        </>
    )
}