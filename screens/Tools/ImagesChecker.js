import React from 'react';
import {  View,ScrollView,Dimensions,LogBox } from 'react-native';
import {Layout as Lay,Text,Card,Input,List,ListItem,Divider,useTheme} from '@ui-kitten/components'
import {MediaTypeOptions} from 'expo-image-picker'
import i18n from 'i18n-js'
LogBox.ignoreLogs(['VirtualizedLists should']);

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Backdrop from '@pn/components/global/Backdrop';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners,showInterstisial} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import { ucwords,extractMeta,randomInt } from '@pn/utils/Main';
import verifyRecaptcha from '@pn/module/Recaptcha'
import { convertFile, pickImage } from '@pn/utils/PickLibrary';
import ShareModule from '@pn/module/Share';
import Portalnesia from '@pn/module/Portalnesia';

const {width:screenWidth} = Dimensions.get("window")

export default function({navigation}){
    const {PNpost} = useAPI(false)
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [loading,setLoading] = React.useState(false)
    const [open,setOpen]=React.useState(false)
    //const {height,width}=useWindowDimensions()
    //const theme = useTheme()
    const [url,setUrl]=React.useState("");
    const [file,setFile]=React.useState(null);
    const [dataFile,setDataFile]=React.useState(null);
    const [backdrop,setBackdrop]=React.useState(false)
    const [progress,setProgress]=React.useState(0);
    const [result,setResult]=React.useState([])
    const [yOffset,setYOffset] = React.useState(null)
    const scrollRef=React.useRef(null)
    const {showAds} = showInterstisial()

    const inputBlur=()=>{
        if(url.trim().match(/^https?\:\/\//i) !== null) {
            setDataFile(url)
            setFile(null)
        } else setDataFile(null)
    }

    const inputRemove=()=>{
        setFile(null);
        setDataFile(null);
        setUrl("")
        setResult([])
    }

    const onLayout=e=>{
        setYOffset(e?.nativeEvent?.layout?.y)
    }

    const uploadImage=(file=null,url="")=>()=>{
        setResult([])
        if(file===null && url.trim().match(/^https?\:\/\//i) === null) setNotif(true,"Error",i18n.t('errors.image'));
        else {
            setLoading(true)
            setProgress(0)
            setBackdrop(true);
            const opt={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:(progEvent)=>{
                    const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                    setProgress(complete);
                }
            }
            verifyRecaptcha(setNotif)
            .then(token=>{
                return new Promise(res=>{
                    const form=new FormData();
                    if(file !== null) {
                        const {name,match} = extractMeta(file)
                        if(!match) return setNotif(true,"Error",i18n.t('errors.upload'));
                        form.append('file',{uri:file,name,type:`image/${match[1]}`});
                    }
                    form.append('url',url);
                    form.append('recaptcha',token);
                    res(form)
                })
            })
            .then((form)=>{
                return PNpost(`/backend/nsfw_check`,form,opt)
            })
            .then((res)=>{
                if(!res.error) {
                    if(randomInt(3) == 0) showAds();
                    setResult(res.result)
                    setTimeout(()=>{
                        if(yOffset !== null) {
                            scrollRef?.current?.scrollTo({y:yOffset,animated:true})
                        }
                    },500)
                }
            })
            .catch(console.log)
            .finally(()=>{
                setBackdrop(false);
                setLoading(false)
            })
        }
    }

    React.useEffect(()=>{
        if(!backdrop) setTimeout(()=>setProgress(0),500)
    },[backdrop])

    const setOpenImage=React.useCallback((result)=>{
        if(!result.exists) return setNotif(true,"Error",i18n.t('errors.no_image'));
        if(result?.size > 5242880) return setNotif(true,"Error",i18n.t('errors.size_image'));
        setFile(result?.uri)
        setDataFile(result?.uri)
    },[])

    const openImage=React.useCallback(()=>{
        pickImage({mediaTypes:MediaTypeOptions.Images})
        .then(setOpenImage)
        .catch(err=>{
            console.log(err);
            if(err?.type === 0) return;
            if(err?.message) setNotif(true,"Error",err.message);
        })
    },[])

    React.useEffect(()=>{
        const dataListener = (data)=>{
            console.log(data);
            if(typeof data?.data === 'string' && typeof data?.mimeType === 'string') {
                if(data?.mimeType==='text/plain') {
                    setUrl(data?.data);
                    uploadImage(null,data?.data)();
                    
                } else {
                    setFile(data?.data)
                    setDataFile(data?.data)
                    uploadImage(data?.data,"")();
                }
            }
        }
        ShareModule.getSharedData().then(dataListener).catch(console.log)
        ShareModule.addListener(dataListener)
    },[])

    return (
        <>
            <Layout navigation={navigation} title="Images Checker" subtitle="Tools" withBack menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1
                    }}
                    ref={scrollRef}
                >
                    <Lay>
                        <AdsBanners />
                    </Lay>
                    <Lay key={0} style={{paddingVertical:10}}>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text>This online tool will help you to check if your image contains NSFW (Not Safe To Work) or not. Using 5 categories: Sexy, Neutral, Porn, Drawing, or Hentai.</Text>
                        </Lay>
                        <Lay style={{paddingVertical:10}}>
                            <RenderImage dataFile={dataFile} openImage={openImage} />
                        </Lay>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text style={{marginBottom:10}}>You can also use an image URL for analysis</Text>
                            <Input
                                value={url}
                                onChangeText={(text)=>setUrl(text)}
                                label="Image URL"
                                keyboardType='url'
                                returnKeyType="send"
                                //onSubmitEditing={handleGenerate}
                                disabled={loading}
                                onBlur={inputBlur}
                            />
                        </Lay>
                        <Lay style={{marginVertical:10}}>
                            <AdsBanner size="MEDIUM_RECTANGLE" />
                        </Lay>
                        <Lay onLayout={onLayout} style={{...(result.length > 0 ? {paddingVertical:10} : {})}}>
                            {result.length > 0 && (
                                <>
                                    <Lay>
                                        <Text style={[style.container,{marginBottom:10}]}>Result:</Text>
                                        <List
                                            renderItem={(prop)=> <RenderRow {...prop} />}
                                            ItemSeparatorComponent={Divider}
                                            data={result}
                                        />
                                    </Lay>
                                </>
                            )}
                        </Lay>
                        <Lay>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button disabled={loading} status="danger" onPress={inputRemove}>Reset</Button>
                            </Lay>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button loading={loading} disabled={loading} onPress={uploadImage(file,url)} >Analysis</Button>
                            </Lay>
                        </Lay>
                    </Lay>
                </ScrollView>
            </Layout>
            <MenuContainer
                visible={open}
                handleOpen={()=>setOpen(true)}
                handleClose={()=>setOpen(false)}
                onClose={()=>setOpen(false)}
                type="tools"
                item_id="images_checker"
                share={{
                    link:`/images-checker?utm_campaign=tools`,
                    title:`Images Checker - Portalnesia`
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
                    title:i18n.t('feedback'),
                    action:'feedback'
                }]}
            />
            <Backdrop
                visible={backdrop}
                progress={progress}
                text={progress<100 ? "Uploading..." : "Processing..."}
            />
        </>
    )
}

const RenderImage=React.memo(({dataFile,openImage})=>{
    if(dataFile === null) {
        return (
            <Card onPress={openImage} style={[style.container,{width:screenWidth-20,height:screenWidth-20,borderRadius:10,margin:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}]}>
                <View>
                    <Text>{i18n.t('select',{type:i18n.t('image')})}</Text>
                </View>
            </Card>
        )
    }
    return (
        <View>
            <Image source={{uri:dataFile}} fullSize animated={false} />
        </View>
    )
})

const RenderRow=React.memo(({item,index})=>(
    <ListItem disabled key={index} title={item?.probability} description={`${ucwords(item.category)} probability`} />
))