import React from 'react'
import {  View,ScrollView,Dimensions } from 'react-native';
import {Layout as Lay,Text,Divider,useTheme, Icon, TopNavigationAction} from '@ui-kitten/components'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import FastImage from 'react-native-fast-image'
import Skltn from 'react-native-skeleton-placeholder'
import RNFS from 'react-native-fs'
import {Modalize} from 'react-native-modalize'

import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import Layout from '@pn/components/global/Layout';
import {ImageFull} from '@pn/components/global/Image'
import Button from '@pn/components/global/Button'
import ImageCropper from '@pn/components/global/ImageCropper/ImageCropper'
import {CONTENT_URL} from '@env'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {AuthContext} from '@pn/provider/AuthProvider'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'

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
    const {data,error} = useSWR(slug ? `/twibbon/${slug}` : null)
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
        ImagePicker.requestMediaLibraryPermissionsAsync()
        .then(({status})=>{
            return new Promise((res,rej)=>{
                if(status !== 'granted') return rej({type:1,message:"Sorry, we need camera roll permissions"})
                return res();
            })
        })
        .then(()=>{
            return ImagePicker.launchImageLibraryAsync({
                mediaTypes:ImagePicker.MediaTypeOptions.Images
            })
        })
        .then(result=>{
            return new Promise((res,rej)=>{
                if(result.cancelled) return rej({type:0})
                return res(result)
            })
        })
        .then((result)=>{
            return FileSystem.getInfoAsync(result.uri)
        })
        .then((result)=>{
            return new Promise((res,rej)=>{
                if(!result.exists) return rej({type:1,message:"Cannot find image"})
                return res(result)
            })
        })
        .then((result)=>{
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
        await RNFS.moveFile(uri,`file://${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${filename}`);
        setNotif(false,"Saved!");
        setLoading(false)
    }

    const Menu = ()=>(
        <>
            <TopNavigationAction icon={SupportIcon} onPress={()=>modalRef.current?.open()} />
            <MenuToggle onPress={()=>setOpen(true)} />
        </>
    )

    return (
        <>
            <Layout navigation={navigation} title="Twibbon" {...(data && data?.twibbon) ? {subtitle:data?.twibbon?.title} : {}} withBack menu={Menu} margin={35} align="start">
                <AdsBanner />
                {!data && !error ? <SkeletonTwibbon /> 
                : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : (
                    <ScrollView
                        contentContainerStyle={{
                            flex:1
                        }}
                    >
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
                                    <Button disabled={loading} appearance='ghost' status='basic' onPress={openImage}>Select image</Button>
                                    {file !== null && (
                                        <>
                                            <Button disabled={loading} status='danger' onPress={rotateImage} accessoryLeft={RotateIcon} />
                                            <Button disabled={loading} loading={loading} onPress={saveImage}>Save</Button>
                                        </>
                                    ) }
                                </View>
                            </View>
                            <View>
                                <AdsBanners />
                            </View>
                        </Lay>
                    </ScrollView>
                )}
            </Layout>
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
                            <Text category="h6">Twibbon Usage Guide</Text>
                        </View>
                        <Divider style={{backgroundColor:theme['border-text-color'],marginVertical:5}} />
                        <View style={{marginTop:10,paddingHorizontal:15}}>
                            <View key={0} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                <Text style={{marginRight:5}}>1.</Text>
                                <Text>Click the <Text style={{fontFamily:'Inter_SemiBold',textDecorationLine:"underline"}} status="info" onPress={()=>(openImage(),modalRef?.current?.close())}>Select Image</Text> button.</Text>
                            </View>
                            <View key={1} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                <Text style={{marginRight:5}}>2.</Text>
                                <Text>Choose the photo.</Text>
                            </View>
                            <View key={2} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                <Text style={{marginRight:5}}>3.</Text>
                                <Text>Edit your photo by drag and pinch gesture.</Text>
                            </View>
                            <View key={4} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                <Text style={{marginRight:5}}>4.</Text>
                                <Text>When you have finished editing, click the <Text style={{fontFamily:'Inter_SemiBold'}}>save</Text> button.</Text>
                            </View>
                            <View key={5} style={{marginBottom:5,flexDirection:'row',alignItems:'flex-start'}}>
                                <Text style={{marginRight:5}}>5.</Text>
                                <Text>Done.</Text>
                            </View>
                        </View>
                    </View>
                </Lay>
            </Modalize>
            {data && !data?.error ? (
                <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    share={{
                        link:`/twibbon/${data?.twibbon?.slug}?utm_campaign=tools`,
                        title:`${data?.twibbon?.title} - Portalnesia Twibbon`
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
            ) : null}
            
        </>
    )
}