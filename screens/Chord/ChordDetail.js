import React from 'react';
import { Animated,RefreshControl,ScrollView,useWindowDimensions,View } from 'react-native';
import {Layout as Lay,Text,useTheme,Divider,Card,ButtonGroup,Icon,Spinner} from '@ui-kitten/components'
import {useLinkTo} from '@react-navigation/native'
import Skeleton from '@pn/components/global/Skeleton'
import Modal from 'react-native-modal'
import YoutubePlayer from 'react-native-youtube-iframe'
import WebView from 'react-native-autoheight-webview'

import Layout from '@pn/components/global/Layout';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import Chord from '@pn/components/global/Chord'
import Button from '@pn/components/global/Button'
import {ucwords} from '@pn/utils/Main'


const MinusIcon=(props)=><Icon {...props} name="minus" />
const PlusIcon=(props)=><Icon {...props} name="plus" />
const XIcon=(props)=><Icon {...props} name="close" />

const fontArray = [10,11,12,13,14,15,16,17,18]

export default function({navigation,route}){
    const {slug} = route.params
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(`/chord/${slug}`,{},false)
    const [open,setOpen]=React.useState(false)
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:40}	
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub
    const {width} = useWindowDimensions()
    const [tools,setTools]=React.useState({fontSize:4,transpose:0,autoScroll:0})
    const [showMenu,setShowMenu]=React.useState(null)
    const linkTo = useLinkTo()

    const transpose = React.useMemo(()=>{
        const angka = tools.transpose
        if(angka < -12 || angka > 12) {
            if(angka < -12) return -12;
            else return 12
        }
        return angka
    },[tools.transpose])

    const handleTranspose=(type)=>()=>{
        if(type==='min') {
            if(transpose > -12) setTools({...tools,transpose:transpose-1})
        } else if(type === 'plus') {
            if(transpose < 12) setTools({...tools,transpose:transpose+1})
        } else {
            setTools({...tools,transpose:0})
        }
    }

    const handleFont=(type)=>()=>{
        if(type==='min') {
            if(fSize > 0) setTools({...tools,fontSize:fSize-1})
        } else if(type === 'plus') {
            if(fSize < 8) setTools({...tools,fontSize:fSize+1})
        } else {
            setTools({...tools,fontSize:4})
        }
    }

    const fSize = React.useMemo(()=>{
        const angka = tools.fontSize
        if(angka < 0 || angka > 8) {
            if(angka < 0) return 0;
            else return 8
        }
        return angka
    },[tools.fontSize])

    const AS = React.useMemo(()=>{
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
    }

    const togglePlaying=React.useCallback(()=>{
        setPlaying(prev=>!prev)
    },[])

    const onStateChange=React.useCallback((state)=>{
        if(state==='ended') {
            setPlaying(false)
        }
    },[])

    React.useEffect(()=>{
        let timeout=null;
        if(!ready) {
            timeout = setTimeout(()=>{
                setReady(true)
            },500)
        }
        return ()=>{
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready])

    React.useEffect(()=>{
        if (slug === 'popular') return navigation.replace("MainTabs",{screen:"Chord",params:{slug:'popular'}})
        return ()=>{
            setReady(false)
        }
    },[route])

    return (
        <>
        <Layout navigation={navigation} custom={
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title={"Chord"} subtitle={data?.chord ? `${data?.chord?.title} - ${data?.chord?.artist}` : ``} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />}>
                    <Lay style={{height:heightt?.sub,flexDirection:'row',alignItems:'center',justifyContent:'space-evenly'}}>
                        <Lay>
                            <Button size="small" status="basic" appearance="ghost" onPress={()=>{setShowMenu('transpose')}}>Transpose</Button>
                        </Lay>
                        <Lay>
                            <Button size="small" status="basic" appearance="ghost" onPress={()=>{setShowMenu('font size')}}>Font Size</Button>
                        </Lay>
                    </Lay>
                </Header>

            </Animated.View>
        }>
            
            {!data && !error ? (
                <View style={{height:'100%',paddingTop:heightHeader+8}}>
                    <Skeleton type="article" />
                </View>
            ) : error || data?.error ? (
                <NotFound {...(data?.error ? {children:<Text>{data?.msg}</Text>} : {})} />
            ) : data?.chord?.text ? (
                <Animated.ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader+8
                    }}
                    {...other}
                    {...(!data && !error || (!isValidating && (!error || data?.error==0)) ? {refreshControl: <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}
                >
                    <Lay key={0} style={[style.container,{paddingTop:10}]}>
                        <Text category="h3">{data?.chord?.title}</Text>
                        <Lay key="lay-0" style={{marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text numberOfLines={1} style={{flex:1,marginRight:20}}>
                                <Text style={{fontSize:13}}>Artist: </Text>
                                <Text style={{fontSize:13,textDecorationLine:"underline"}} status="info" onPress={()=>linkTo(`/chord/artist/${data?.chord?.slug_artist}`)} >{data?.chord?.artist}</Text>
                            </Text>
                            <Text style={{fontSize:13}}>{`${data?.chord?.seen?.format} views`}</Text>
                        </Lay>
                        <Lay key="lay-1" style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text numberOfLines={1} style={{flex:1,marginRight:20}}>
                                <Text style={{fontSize:13}}>Author: </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}} onPress={()=>linkTo(`/user/${data?.chord?.users?.username}`)}>{data?.chord?.users?.name||"Portalnesia"}</Text>
                            </Text>
                            <Text style={{fontSize:13}}>{`${data?.chord?.date}`}</Text>
                        </Lay>
                    </Lay>

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

                    <Lay key={1} style={{paddingBottom:30}}>
                        <Divider style={{marginVertical:10,height:2,backgroundColor:theme['border-text-color']}} />
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
                </Animated.ScrollView>
            ) : null}
        </Layout>
        {data && ready && (
                <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    share={{
                        link:`/chord/${data?.chord?.slug}?utm_campaign=chord`,
                        title:`Chord ${data?.chord?.artist} - ${data?.chord?.title}`,
                        dialog:"Share Chord"
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