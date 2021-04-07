import React from 'react';
import {  View,ScrollView,useWindowDimensions,KeyboardAvoidingView,Share } from 'react-native';
import {Layout as Lay,Text,Spinner,Input,useTheme} from '@ui-kitten/components'
//import useSWR from '@pn/utils/swr'
//import Modal from 'react-native-modal'
import {openBrowserAsync} from 'expo-web-browser'

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Recaptcha from '@pn/components/global/Recaptcha'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
//import Pagination from '@pn/components/global/Pagination'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/AuthProvider';
import {CONTENT_URL} from '@env'
import downloadFile from '@pn/utils/Download'

export default function URLshortener({navigation}){
    const {PNpost} = useAPI(false)
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const {copyText} = useClipboard()
    const [open,setOpen]=React.useState(false)
    const [input,setInput] = React.useState({url:'',custom:'',recaptcha:''})
    const [loading,setLoading] = React.useState(false)
    const {height,width}=useWindowDimensions()
    const theme = useTheme()
    const [result,setResult]=React.useState(null)
    const customRef=React.useRef(null)
    const captcha = React.useRef(null)

    const onReceiveToken=(token)=>{
        setInput({...input,recaptcha:token})
    }

    const handleInputChange=(name)=>val=>{
        if(name==='custom') {
            return;
        } else {
            setInput({
                ...input,
                [name]:val
            })
        }
    }

    const handleCustomFocus=()=>{
        setNotif(true,"Under Maintenance","Only for registered users");
        customRef.current?.blur()
    }

    const handleSubmit=()=>{
        if(input.url.match(/\S+/) === null) return setNotif(true,"Error","URL cannot be empty");
        setResult(null);
        setLoading(true);
        PNpost('/url/short',input)
        .then(res=>{
            if(!res.error) {
                setInput({url:"",custom:""})
                setResult(res);
            }
        })
        .finally(()=>{
            setLoading(false)
            captcha?.current?.refreshToken()
        })
    }

    const handleShare=text=>()=>{
        Share.share({
            message:text,
            url:text
        },{
            dialogTitle:"Share URL"
        })
    }

    const handleDownload=(result)=>()=>{
        const url = `${CONTENT_URL}/qr/url/${result.custom}`
        const filename = `[portalnesia.com]_${result.custom}.png`;
        downloadFile(url,filename,"pn://url",true)
        .then((res)=>{
            return new Promise((resolve,reject)=>{
                setNotif(false,"Download","Start downloading...");
                res.start()
                .then(()=>resolve)
                .catch(()=>reject)
            })
        })
        .catch(err=>{
            setNotif(true,"Error",err?.message||"Something went wrong");
        })
    }

    return (
        <>
            <Layout navigation={navigation} title="URL Shortener" withBack menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        backgroundColor:theme['background-basic-color-1']
                    }}
                >
                    <Lay>
                        <AdsBanner />
                        <Lay key={0} style={{paddingTop:10,flex:1,flexDirection:'column'}}>
                            <Lay style={[style.container,{flexGrow:1,justifyContent:'flex-start'}]}>
                                <KeyboardAvoidingView>
                                    <Lay style={{paddingVertical:10}}>
                                        <Input
                                            label="URL"
                                            value={input.url}
                                            onChangeText={handleInputChange('url')}
                                            disabled={loading}
                                            placeholder="https://"
                                            keyboardType="url"
                                        />
                                    </Lay>
                                    <Lay style={{paddingVertical:10}}>
                                        <Input
                                            label="Custom"
                                            value={""}
                                            disabled={loading}
                                            onFocus={handleCustomFocus}
                                            ref={customRef}
                                        />
                                    </Lay>
                                </KeyboardAvoidingView>
                            </Lay>
                            <Lay>
                                {result !== null && (
                                    <View style={style.container}>
                                        <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                                            <Image fancybox source={{uri:`${CONTENT_URL}/qr/url/${result.custom}`}} fullSize contentWidth={200} animated={false} forceFancybox />
                                        </View>
                                        <Text category="h5" style={{marginVertical:10}}>{result.status==0 ? "URL has been successfully shortened." : "URL already been shortened by others."}</Text>
                                        <Text><Text>Short URL: </Text><Text status="info" style={{textDecorationLine:"underline"}} onPress={()=>openBrowserAsync(result.short_url)}>{result.short_url}</Text></Text>
                                        <Text style={{marginBottom:10}}>{`Long URL: ${result.long_url}`}</Text>
                                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                            <Button status="basic" appearance="ghost" onPress={()=>copyText(result.short_url)}>Copy</Button>
                                            <Button status="basic" appearance="ghost" onPress={handleDownload(result)}>Download QR Code</Button>
                                            <Button status="basic" appearance="ghost" onPress={handleShare(result.short_url)}>Share</Button>
                                        </View>
                                    </View>
                                )}
                            </Lay>
                            <Lay style={{marginVertical:10}}>
                                <AdsBanners />
                            </Lay>
                            <Lay style={{justifyContent:'flex-end'}}>
                                <Lay style={[style.container,{paddingVertical:5}]}>
                                    <Button loading={loading} disabled={loading} onPress={handleSubmit}>Submit</Button>
                                </Lay>
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
                share={{
                    link:`/url?utm_campaign=tools`,
                    title:`URL Shortener - Portalnesia`
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
        </>
    )
}