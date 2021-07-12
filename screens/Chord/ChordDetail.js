import React from 'react';
import { Animated,RefreshControl,ScrollView,useWindowDimensions,View,LogBox } from 'react-native';
import {Layout as Lay,Text,useTheme,Divider,Card,ButtonGroup,Icon} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import Modal from 'react-native-modal'
import analytics from '@react-native-firebase/analytics'
import RNPrint from 'react-native-print'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'

import {linkTo,pushTo} from '@pn/navigation/useRootNavigation'
import Carousel from '@pn/components/global/Carousel';
import Comment from '@pn/components/global/Comment'
import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import CountUp from '@pn/components/global/Countup'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import Chord,{chord_html} from '@pn/components/global/Chord'
import Button from '@pn/components/global/Button'
import {ucwords} from '@pn/utils/Main'
import i18n from 'i18n-js'
import usePost from '@pn/utils/API'
import {AdsBanner, AdsBanners} from '@pn/components/global/Ads'
import Player from '@pn/components/global/VideoPlayer'
import Backdrop from '@pn/components/global/Backdrop';
import LikeButton from '@pn/components/global/Like'

LogBox.ignoreLogs(['Cannot update a component from inside the function body']);

const AnimLay = Animated.createAnimatedComponent(Lay)
const MinusIcon=(props)=><Icon {...props} name="minus" />
const PlusIcon=(props)=><Icon {...props} name="plus" />
const XIcon=(props)=><Icon {...props} name="close" />

const fontArray = [9,10,11,12,13,14,15,16,17]
const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"1.3.0",">=");

function ChordDetailScreen({navigation,route}){
    const {slug} = route.params
    if (slug === 'popular') {
        navigation.replace("Chord",{slug:'popular'})
        return null;
    }
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(slug !== 'popular' ? `/chord/${slug}` : null)
    const {data:dataOthers,error:errorOthers,mutate:mutateOthers,isValidating:isValidatingOthers} = useSWR(data?.chord?.id ? `/chord/others/${data?.chord?.id}` : null)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:40}
    const {width} = useWindowDimensions()
    const [tools,setTools]=React.useState({fontSize:4,transpose:0,autoScroll:0})
    const [showMenu,setShowMenu]=React.useState(null)
    const {PNget} = usePost();
    const [backdrop,setBackdrop] = React.useState(false);
    const [viewVideo,setViewVideo] = React.useState(false)
    const [liked,setLiked] = React.useState(false)
    const [refreshing,setRefreshing] = React.useState(false);

    React.useEffect(()=>{
        if(!isValidating) setRefreshing(false)
    },[isValidating])
    
    const onRefresh=React.useCallback(()=>{
        if(!isValidating) {
            setRefreshing(true);
            mutate();
        }
    },[isValidating])

    const heightHeader = React.useMemo(()=>{
        return heightt?.main + heightt?.sub;
    },[])

    const {translateY,onScroll,...other} = useHeader()

    const transpose = React.useMemo(()=>{
        const angka = tools.transpose
        if(angka < -12 || angka > 12) {
            if(angka < -12) return -12;
            else return 12
        }
        return angka
    },[tools.transpose])

    const handleTranspose=(type)=>()=>{
        requestAnimationFrame(()=>{
            if(type==='min') {
                if(transpose > -12) setTools({...tools,transpose:transpose-1})
            } else if(type === 'plus') {
                if(transpose < 12) setTools({...tools,transpose:transpose+1})
            } else {
                setTools({...tools,transpose:0})
            }
        })
    }

    const handleFont=(type)=>()=>{
        requestAnimationFrame(()=>{
            if(type==='min') {
                if(fSize > 0) setTools({...tools,fontSize:fSize-1})
            } else if(type === 'plus') {
                if(fSize < 8) setTools({...tools,fontSize:fSize+1})
            } else {
                setTools({...tools,fontSize:4})
            }
        })
    }

    const fSize = React.useMemo(()=>{
        const angka = tools.fontSize
        if(angka < 0 || angka > 8) {
            if(angka < 0) return 0;
            else return 8
        }
        return angka
    },[tools.fontSize])

    /*const AS = React.useMemo(()=>{
        const angka = tools.autoScroll
        if(angka < 0 || angka > 5) {
            if(angka < 0) return 0;
            else return 5
        }
        return angka
    },[tools.autoScroll])

    const handleAutoScroll = (type)=>()=>{
        if(type==='min') {
            if(AS > 0) setTools({...tools,autoScroll:AS-1})
        } else if(type === 'plus') {
            if(AS < 8) setTools({...tools,autoScroll:AS+1})
        } else {
            setTools({...tools,autoScroll:0})
        }
    }*/

    const handlePrint=React.useCallback(async()=>{
        if(data?.chord) {
            setBackdrop(true)
            try {
                const b = chord_html(data?.chord,transpose);
                
                await RNPrint.print({
                    html:b,
                    jobName:"Chord"
                })
            } catch(e) {
                consoloe.log(e)
            } finally {
                setBackdrop(false)
            }
        }
    },[data,transpose])

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            if(!__DEV__) {
                await analytics().logSelectContent({
                    content_type:'chord',
                    item_id:String(data?.chord?.id)
                })
                await PNget(`/chord/${slug}/update`);
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
            chord:{
                ...data?.chord,
                liked:val
            }
        })
    },[data,mutate])

    React.useEffect(()=>{
        if(data) {
            setLiked(data?.chord?.liked);
        }
    },[data])

    return (
        <>
        <Layout navigation={navigation}>
            <AnimLay style={{left: 0,right: 0,width: '100%',zIndex: 1,...(!viewVideo ? {position:'absolute',transform: [{translateY}]} : {})}}>
                <Header title={"Chord"} subtitle={data?.chord ? `${data?.chord?.title} - ${data?.chord?.artist}` : ``} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{data && !data?.error && setOpen(true)}} />}>
                    <Lay style={{height:heightt?.sub,flexDirection:'row',alignItems:'center',justifyContent:'space-evenly'}}>
                        <Lay>
                            <Button size="small" status="basic" appearance="ghost" onPress={()=>{data && setShowMenu('transpose')}}>Transpose</Button>
                        </Lay>
                        <Lay>
                            <Button size="small" status="basic" appearance="ghost" onPress={()=>{data && setShowMenu('font size')}}>Font Size</Button>
                        </Lay>
                        {isUpdated && (
                            <Lay>
                                <Button size="small" status="basic" appearance="ghost" onPress={handlePrint}>Print</Button>
                            </Lay>
                        )}
                    </Lay>
                    {typeof data?.chord?.youtube_id === 'string' && viewVideo ? (
                        <Lay>
                            <Player youtube={data?.chord?.youtube_id} />
                        </Lay>
                    ) : null}
                </Header>
            </AnimLay>
            <Animated.ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    ...(!viewVideo ? {paddingTop:heightHeader+2} : {})
                }}
                onScroll={onScroll}
                refreshControl={
                    <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={refreshing} onRefresh={onRefresh}/>
                }
                {...other}
            >
                {!data && !error ? (
                    <View style={{height:'100%',paddingTop:15}}>
                        <Skeleton type="article" />
                    </View>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : data?.chord?.text ? (
                    <>
                        <Lay key={0} style={[style.container,{paddingTop:10}]}>
                            <Text category="h3">{data?.chord?.title}</Text>
                            <Lay key="lay-0" style={{marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <Text numberOfLines={1} style={{flex:1,marginRight:20}}>
                                    <Text style={{fontSize:13}}>Artist: </Text>
                                    <Text style={{fontSize:13,textDecorationLine:"underline"}} status="info" onPress={()=>linkTo(`/chord/artist/${data?.chord?.slug_artist}`)} >{data?.chord?.artist}</Text>
                                </Text>
                                <Text style={{fontSize:13}}><Text><CountUp data={data?.chord?.seen} /></Text> <Text>views</Text></Text>
                            </Lay>
                            <Lay key="lay-1" style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <Text numberOfLines={1} style={{flex:1,marginRight:20}}>
                                    <Text style={{fontSize:13}}>Author: </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}} onPress={()=>linkTo(`/user/${data?.chord?.users?.username}`)}>{data?.chord?.users?.name||"Portalnesia"}</Text>
                                </Text>
                                <Text style={{fontSize:13}}>{`${data?.chord?.date}`}</Text>
                            </Lay>
                            <Lay key="lay-3" style={{flexDirection:'row',alignItems:'center',justifyContent:"flex-end"}}>
                                <LikeButton value={liked} onSuccess={handleOnSuccess} type="chord" item_id={data?.chord?.id} />
                            </Lay>
                        </Lay>

                        <Lay><Divider style={{marginVertical:10,height:2,backgroundColor:theme['border-text-color']}} /></Lay>
                        
                        
                        <Lay key={1} style={{paddingBottom:20}}>
                            <Lay style={{marginVertical:10,marginBottom:20}}><AdsBanner /></Lay>
                            <ScrollView
                                horizontal
                                contentContainerStyle={{
                                    flexGrow: 1,
                                }}
                            >
                                <Lay key={2} style={style.container}>
                                    <Chord template={data?.chord?.text} transpose={transpose} fontSize={fontArray[fSize]} />
                                </Lay>
                            </ScrollView>
                        </Lay>

                        <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                        
                        <Lay style={[style.container]}>
                            <Text>Your chord aren't here? <Text status="info" style={{textDecorationLine:"underline"}} onPress={()=>linkTo(`/contact?subject=${encodeURIComponent("Request Chord")}`)}>request your chord</Text>.</Text>
                            <Lay style={{marginTop:20}}><AdsBanners size="MEDIUM_RECTANGLE" /></Lay>
                        </Lay>
                        <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                        {data && data?.chord?.id ? (
                            <>
                                <Lay style={{paddingBottom:20}}>
                                    <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended_type',{type:i18n.t('chord')})}</Text>
                                    {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{paddingHorizontal:15}}><Skeleton type='caraousel' height={100} /></Lay>
                                    : errorOthers || dataOthers?.error==1 ? (
                                        <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                                    ) : dataOthers?.relateds?.length > 0 ? (
                                        <Carousel
                                            data={dataOthers?.relateds}
                                            renderItem={(props)=><RenderCaraousel {...props} />}
                                            autoplay
                                        />
                                    ) : (
                                        <Text style={{paddingHorizontal:15}}>No posts</Text>
                                    )}
                                </Lay>
                                <Lay style={{paddingBottom:20}}>
                                    <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('popular_type',{type:i18n.t('chord')})}</Text>
                                    {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{paddingHorizontal:15}}><Skeleton type='caraousel' height={100} /></Lay>
                                    : errorOthers || dataOthers?.error==1 ? (
                                        <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                                    ) : dataOthers?.populars?.length > 0 ? (
                                        <Carousel
                                            data={dataOthers?.populars}
                                            renderItem={(props)=><RenderCaraousel {...props} />}
                                            autoplay
                                        />
                                    ) : (
                                        <Text style={{paddingHorizontal:15}}>No posts</Text>
                                    )}
                                </Lay>
                                <Lay style={{paddingBottom:20}}>
                                    <Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recent_type',{type:i18n.t('chord')})}</Text>
                                    {(!dataOthers && !errorOthers) || isValidatingOthers ? <Lay style={{paddingHorizontal:15}}><Skeleton type='caraousel' height={100} /></Lay>
                                    : errorOthers || dataOthers?.error==1 ? (
                                        <Text style={{paddingHorizontal:15}}>Failed to load data</Text>
                                    ) : dataOthers?.recents?.length > 0 ? (
                                        <Carousel
                                            data={dataOthers?.recents}
                                            renderItem={(props)=><RenderCaraousel {...props} />}
                                            autoplay
                                        />
                                    ) : (
                                        <Text style={{paddingHorizontal:15}}>No posts</Text>
                                    )}
                                </Lay>
                                <Divider style={{backgroundColor:theme['border-text-color']}} />
                                <Lay style={{paddingBottom:50,paddingTop:10}}>
                                    <Comment navigation={navigation} total={data?.chord?.comment_count} type="chord" posId={data?.chord?.id} posUrl={`chord/${data?.chord?.slug}`} />
                                </Lay>
                            </>
                        ): null}
                        
                        <Modal
                            isVisible={showMenu!==null}
                            style={{margin:0,justifyContent:'center',alignItems:'center'}}
                            onBackdropPress={()=>{setShowMenu(null)}}
                            animationIn="fadeIn"
                            animationOut="fadeOut"
                        >
                            <Card style={{width:width-30,justifyContent:'center',alignItems:'center'}} disabled header={(props)=><View {...props}><Text>{ucwords(showMenu)}</Text></View>}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    {showMenu === 'transpose' ? (
                                        <>
                                            <Button style={{borderWidth:0,height:37.8}} accessoryLeft={XIcon} disabled={transpose === 0} size="small" status="danger" onPress={handleTranspose('reset')} />
                                            <ButtonGroup size="small">
                                                <Button disabled={transpose<=-12} accessoryLeft={MinusIcon} onPress={handleTranspose('min')} />
                                                <Button disabled status="basic"><Text>{transpose.toString()}</Text></Button>
                                                <Button accessoryLeft={PlusIcon} disabled={transpose >= 12} onPress={handleTranspose('plus')} />
                                            </ButtonGroup>
                                        </>
                                    ): showMenu === 'font size' ? (
                                        <>
                                            <Button style={{borderWidth:0,height:37.8}} accessoryLeft={XIcon} disabled={fSize === 4} size="small" status="danger" onPress={handleFont('reset')} />
                                            <ButtonGroup size="small">
                                                <Button disabled={fSize<=0} accessoryLeft={MinusIcon} onPress={handleFont('min')} />
                                                <Button disabled status="basic"><Text>{fSize.toString()}</Text></Button>
                                                <Button accessoryLeft={PlusIcon} disabled={fSize >= 8} onPress={handleFont('plus')} />
                                            </ButtonGroup>
                                        </>
                                    ) : <Text>Under Maintenance</Text> }
                                </View>
                            </Card>
                        </Modal>
                    </>
                ) : null}
            </Animated.ScrollView>
        </Layout>
        <Backdrop loading visible={backdrop} />
        {data && !data?.error && (
                <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    type="chord"
                    item_id={data?.chord?.id}
                    share={{
                        link:`/chord/${data?.chord?.slug}?utm_campaign=chord`,
                        title:`Chord ${data?.chord?.artist} - ${data?.chord?.title}`,
                        dialog:i18n.t('share_type',{type:i18n.t('chord')})
                    }}
                    menu={[{
                        title:viewVideo ? i18n.t('hide_type',{type:i18n.t('media.video_player')}) : i18n.t('show_type',{type:i18n.t('media.video_player')}),
                        onPress:()=>{
                            setViewVideo(p=>!p);
                        },
                        icon:"play-circle"
                    },{
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
                        action:'report',
                        beforeAction:()=>setViewVideo(false)
                    }]}
                />
            )}
        </>
    )
}

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(`/chord/${item?.slug}`)}>
			<Text category="p1" style={{fontWeight:"600"}}>{`${item?.artist} - ${item?.title}`}</Text>
            <Text category="label" style={{marginTop:10}}>{item?.original}</Text>
		</Card>
	);
})

export default React.memo(ChordDetailScreen)