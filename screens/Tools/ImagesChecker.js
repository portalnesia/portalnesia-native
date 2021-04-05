import React from 'react';
import {  View,ScrollView,Dimensions,LogBox } from 'react-native';
import {Layout as Lay,Text,Card,Input,List,ListItem,Divider,useTheme} from '@ui-kitten/components'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

LogBox.ignoreLogs(['VirtualizedLists should']);

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Backdrop from '@pn/components/global/Backdrop';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners,showInterstisial} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/AuthProvider';
import { ucwords,extractMeta,randomInt } from '@pn/utils/Main';
import Recaptcha from '@pn/components/global/Recaptcha'

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
    const [recaptcha,setRecaptcha]=React.useState("");
    const [file,setFile]=React.useState(null);
    const [dataFile,setDataFile]=React.useState(null);
    const [backdrop,setBackdrop]=React.useState(false)
    const [progress,setProgress]=React.useState(0);
    const [result,setResult]=React.useState([])
    const [yOffset,setYOffset] = React.useState(null)
    const scrollRef=React.useRef(null)
    const captcha = React.useRef(null)

    const onReceiveToken=(token)=>{
        setRecaptcha(token)
    }

    const dtFileImg = React.useMemo(()=>dataFile,[dataFile])

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

    const uploadImage=()=>{
        setResult([])
        if(file===null && url.trim().match(/^https?\:\/\//i) === null) setNotif(true,"Error","Please select image first");
        else {
            setLoading(true)
            setProgress(0)
            setBackdrop(true);
            const form=new FormData();
            if(file !== null) {
                const {name,match} = extractMeta(file)
                if(!match) return setNotif(true,"Error","Sorry, error while uploading your image");
                form.append('file',{uri:file,name,type:`image/${match[1]}`});
            }
            form.append('url',url);
            form.append('recaptcha',recaptcha);
            const opt={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:(progEvent)=>{
                    const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                    setProgress(complete);
                }
            }
            PNpost(`/backend/nsfw_check`,form,opt)
            .then((res)=>{
                setNotif(Boolean(res.error),res.msg)
                if(!res.error) {
                    if(randomInt(3) == 0) showInterstisial();
                    setResult(res.result)
                    setTimeout(()=>{
                        if(yOffset !== null) {
                            scrollRef?.current?.scrollTo({y:yOffset,animated:true})
                        }
                    },500)
                }
            }).finally(()=>{
                setBackdrop(false);
                setLoading(false)
                captcha?.current?.refreshToken()
            })
        }
    }

    React.useEffect(()=>{
        if(!backdrop) setTimeout(()=>setProgress(0),500)
    },[backdrop])

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
            if(result?.size > 5242880) return setNotif(true,"Error","Sorry, your file is too large. Maximum images size is 5 MB")
            setFile(result?.uri)
            setDataFile(result?.uri)
        })
        .catch(err=>{
            if(err?.type === 0) return;
            if(err?.message) setNotif(true,"Error",err.message);
        })
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
                            <RenderImage dataFile={dtFileImg} openImage={openImage} />
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
                            <AdsBanner />
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
                                <Button loading={loading} disabled={loading} onPress={uploadImage} >Analysis</Button>
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
                    title:"Share",
                },{
                    title:"Copy link",
                    action:'copy'
                },{
                    title:"Open in browser",
                    action:'browser'
                }]}
            />
            <Recaptcha ref={captcha} onReceiveToken={onReceiveToken} />
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
                    <Text>Select image</Text>
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