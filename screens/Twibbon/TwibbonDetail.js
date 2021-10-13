import React from 'react'
import {  View,ScrollView,Dimensions,RefreshControl } from 'react-native';
import {Layout as Lay,Text,Divider,useTheme, Icon} from '@ui-kitten/components'
import {MediaTypeOptions} from 'expo-image-picker'
import FastImage from '@pn/module/FastImage'
import Skltn from 'react-native-skeleton-placeholder'
import RNFS from 'react-native-fs'
import {Modalize} from 'react-native-modalize'

import TopNavigationAction from '@pn/components/navigation/TopAction'
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import Layout from '@pn/components/global/Layout';
import {ImageFull} from '@pn/components/global/Image'
import Button from '@pn/components/global/Button'
import ImageCropper from '@pn/components/global/ImageCropper/ImageCropper'
import {CONTENT_URL} from '@env'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {AuthContext} from '@pn/provider/Context'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import i18n from 'i18n-js'
import { ucwords } from '@portalnesia/utils';
import { pickImage } from '@pn/utils/PickLibrary';
import {Portal} from '@gorhom/portal'
import {moveFile} from '@pn/utils/Download'

const {width:winWidth,height:winHeight} = Dimensions.get("window");
const SupportIcon = (props)=> <Icon {...props} name="question-mark-circle-outline" />
const RotateIcon = (props) => {
    return <Icon {...props} name="rotate-right" pack='material' />
}

const SkeletonTwibbon=React.memo(()=>{
    const theme = useTheme()
    return (
        <Skltn height={winHeight} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Skltn.Item>
                <Skltn.Item marginTop={10} width={winWidth} height={winWidth} />
                <Skltn.Item padding={15}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Skltn.Item width={100} height={30} />
                        <Skltn.Item width={40} height={30} />
                        <Skltn.Item width={100} height={30} />
                    </View>
                </Skltn.Item>
            </Skltn.Item>
        </Skltn>
    )
})

export default function TwibbonDetail({navigation,route}){
    const {slug} = route?.params;
    const context = React.useContext(AuthContext)
    const {setNotif} = context;
    const theme = useTheme();
    const {data,error,mutate,isValidating} = useSWR(slug ? `/twibbon/${slug}` : null,{},true)
    const [file,setFile] = React.useState(null);
    const captureRef = React.useRef(null)
    const modalRef = React.useRef(null)
    const [rotation,setRotation]=React.useState(0)
    const [loading,setLoading] = React.useState(false)
    const [open,setOpen] = React.useState(false)

    const Header = (
        <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
            <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
        </View>
    )

    const openImage=React.useCallback(()=>{
        pickImage({mediaTypes:MediaTypeOptions.Images})
        .then((result)=>{
            if(!result.exists) return setNotif(true,"Error",i18n.t('errors.no_image'));
            setFile(result?.uri)
        })
        .catch(err=>{
            if(err?.type === 0) return;
            if(err?.message) setNotif(true,"Error",err.message);
        })
    },[])

    const rotateImage=()=>{
        const arr=[0,90,180,270,360];
        const find = arr.findIndex(i=>i===rotation);
        const next = find === 3 ? 0 : find+1;
        setRotation(arr[next]);
    }

    const saveImage = async() =>{
        setLoading(true)
        const uri = await captureRef.current?.capture();
        const date = new Date().getTime();
        const filename = `Twibbon_${data?.twibbon?.slug}_${date}.png`;
        await moveFile(uri,filename,"image/png");
        setNotif(false,"Saved!");
        setLoading(false)
    }

    const Menu = ()=>(
        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
            <TopNavigationAction tooltip={i18n.t('usage_guide',{type:"Twibbon"})} icon={SupportIcon} onPress={()=>modalRef.current?.open()} />
            <MenuToggle onPress={()=>{data && !data?.error && setOpen(true)}} />
        </View>
    )

    return (
        <>
            <Layout navigation={navigation} title="Twibbon" {...(data && data?.twibbon) ? {subtitle:data?.twibbon?.title} : {}} withBack menu={Menu} margin={35} align="center">
                <ScrollView
                    contentContainerStyle={{
                        flexGrow:1
                    }}
                    refreshControl={
                        <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e"  refreshing={isValidating && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>!isValidating && mutate()}/>
                    }
                >
                    {!data && !error ? <SkeletonTwibbon /> 
                    : error || data?.error ? (
                        <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                    ) : (
                        <>
                            <AdsBanner />
                            <Lay style={{flex:1,marginTop:10}}>
                                <View testID="View-shot">
                                    {file !== null ? (
                                        <ImageCropper
                                            captureRef={captureRef}
                                            background={<FastImage source={require('@pn/assets/transparent.png')} style={{width:winWidth,height:winWidth,}} />}
                                            imageUri={file}
                                            cropAreaWidth={winWidth}
                                            rotation={rotation}
                                            cropAreaHeight={winWidth}
                                            areaColor='transparent'
                                            containerColor='transparent'
                                            areaOverlay={<FastImage source={{uri:data?.twibbon?.image}} style={{width:winWidth,height:winWidth}} />}
                                        />
                                    ) : (
                                        <View style={{width:winWidth,height:winWidth,overflow: 'hidden',alignItems: 'center',justifyContent: 'center'}}>
                                            <FastImage source={require('@pn/assets/transparent.png')} style={{width:winWidth,height:winWidth,position:'absolute',top:0,left:0}} />
                                            <FastImage source={{uri:data?.twibbon?.image}} style={{width:winWidth,height:winWidth,position:'absolute',top:0,left:0}} />
                                        </View>
                                    )}
                                        
                                </View>
                                <View style={{margin:15}}>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                        <Button disabled={loading} appearance='ghost' status='basic' onPress={openImage}>{i18n.t('select',{type:i18n.t('image')})}</Button>
                                        {file !== null && (
                                            <>
                                                <Button tooltip="Rotate" disabled={loading} status='danger' onPress={rotateImage} accessoryLeft={RotateIcon} />
                                                <Button disabled={loading} loading={loading} onPress={saveImage}>{ucwords(i18n.t('save'))}</Button>
                                            </>
                                        ) }
                                    </View>
                                </View>
                                <View>
                                    <AdsBanners />
                                </View>
                            </Lay>
                        </>
                    )}
                </ScrollView>
            </Layout>
            <Portal>
                <Modalize
                    ref={modalRef}
                    withHandle={false}
                    modalStyle={{
                        backgroundColor:theme['background-basic-color-1'],
                    }}
                    adjustToContentHeight
                >
                    <Lay style={{borderTopLeftRadius:20,
                        borderTopRightRadius:20}}>
                        {Header}
                        <View style={{marginVertical:5}}>
                            <View style={{marginTop:10,paddingHorizontal:15}}>
                                <Text category="h6">{i18n.t('usage_guide',{type:"Twibbon"})}</Text>
                            </View>
                            <Divider style={{backgroundColor:theme['border-text-color'],marginVertical:5}} />
                            <View style={{marginTop:10,paddingHorizontal:15}}>
                                <View key={0} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                    <Text style={{marginRight:5}}>1.</Text>
                                    <Text>{i18n.t('twibbon.usage.first')} <Text style={{fontFamily:'Inter_SemiBold',textDecorationLine:"underline"}} status="info" onPress={()=>(openImage(),modalRef?.current?.close())}>{i18n.t('button_type',{type:i18n.t('select',{type:i18n.t('image')})})}</Text>.</Text>
                                </View>
                                <View key={1} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                    <Text style={{marginRight:5}}>2.</Text>
                                    <Text>{i18n.t('twibbon.usage.second')}</Text>
                                </View>
                                <View key={2} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                    <Text style={{marginRight:5}}>3.</Text>
                                    <Text>{i18n.t('twibbon.usage.third')}</Text>
                                </View>
                                <View key={4} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                    <Text style={{marginRight:5}}>4.</Text>
                                    <Text>{i18n.t('twibbon.usage.fourth')} <Text style={{fontFamily:'Inter_SemiBold'}}>{i18n.t('button_type',{type:i18n.t('save')})}</Text>.</Text>
                                </View>
                                <View key={5} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                    <Text style={{marginRight:5}}>5.</Text>
                                    <Text>{i18n.t('twibbon.usage.fifth')}</Text>
                                </View>
                            </View>
                        </View>
                    </Lay>
                </Modalize>
            </Portal>
            {data && !data?.error ? (
                <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    type="twibbon"
                    item_id={data?.twibbon?.id}
                    share={{
                        link:`/twibbon/${data?.twibbon?.slug}?utm_campaign=tools`,
                        title:`${data?.twibbon?.title} - Portalnesia Twibbon`
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
            ) : null}
            
        </>
    )
}