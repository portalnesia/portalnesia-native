import React from 'react';
import {  View,ScrollView,FlatList,KeyboardAvoidingView,Share, Dimensions,RefreshControl,Alert } from 'react-native';
import {Layout as Lay,Text,Spinner,Input,useTheme,Divider,Icon} from '@ui-kitten/components'
//import useSWR from '@pn/utils/swr'
import Modal from 'react-native-modal'

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import Pressable from '@pn/components/global/Pressable'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/AuthProvider';
import {CONTENT_URL} from '@env'
import downloadFile from '@pn/utils/Download'
import verifyRecaptcha from '@pn/module/Recaptcha'
import { Ktruncate, openBrowser } from '@pn/utils/Main';
import i18n from 'i18n-js'
import Brightness from '@pn/module/Brightness';
import usePagination from '@pn/utils/usePagination';
import Skeleton from '@pn/components/global/Skeleton';
import ListItem from '@pn/components/global/ListItem';
import Recaptcha from '@pn/components/global/Recaptcha'
import Backdrop from '@pn/components/global/Backdrop';
import {Portal} from '@gorhom/portal'
import ShareModule from '@pn/module/Share';

const {width,height} = Dimensions.get('window')

const RenderModal=React.memo(({onClose,menu,handleDownload})=>{
    const theme=useTheme();
    return (
		<Lay style={{padding:10,width:width-20,borderRadius:10}}>
			<View style={{marginBottom:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
				<Text>QR Code</Text>
				<View style={{borderRadius:22,overflow:'hidden'}}>
					<Pressable style={{padding:10}} onPress={()=> onClose && onClose()}>
						<Icon style={{width:24,height:24,tintColor:theme['text-hint-color']}} name="close-outline" />
					</Pressable>
				</View>
			</View>
            <Image contentWidth={width-50} source={{uri:`${CONTENT_URL}/qr/url/${menu?.custom}`}} fullSize fancybox={false} />
            <View style={{marginTop:15,flexDirection:'row',justifyContent:'center'}}>
                <Button onPress={()=>{onClose(),handleDownload(menu)()}}>Download</Button>
            </View>
        </Lay>
    )
})

const URLshortenerForm=React.memo(({initialData="",setNotif,user,ads,handleOpenQR,handleCloseQR,onSubmit,handleDownload})=>{
    const {PNpost} = useAPI()
    const {copyText} = useClipboard()
    const [input,setInput] = React.useState({url:initialData,custom:''})
    const [result,setResult]=React.useState(null)
    const customRef=React.useRef(null)
    const [loading,setLoading] = React.useState(false)

    const handleInputChange=(name)=>val=>{
        if(name==='custom' && user===false) {
            return;
        } else {
            setInput({
                ...input,
                [name]:val
            })
        }
    }

    const handleCustomFocus=()=>{
        if(user===false) {
            setNotif(true,"Under Maintenance","Only for registered users");
            customRef.current?.blur()
        }
    }

    const handleSubmit=()=>{
        if(input.url.match(/\S+/) === null) return setNotif(true,"Error","URL cannot be empty");
        setResult(null);
        setLoading(true);
        verifyRecaptcha(setNotif)
        .then(recaptcha=>{
            return PNpost('/url/short',{...input,recaptcha})
        })
        .then(res=>{
            if(!res.error) {
                setInput({url:"",custom:""})
                setResult(res);
                onSubmit();
            }
        })
        .finally(()=>{
            setLoading(false)
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

    React.useEffect(()=>{
        if(initialData?.length > 0) setInput({...input,url:initialData})
    },[initialData]);

    return (
        <Lay>
            {ads && <AdsBanner /> }
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
                                value={input.custom}
                                onChangeText={handleInputChange('custom')}
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
                                <Image onOpen={handleOpenQR} onClose={handleCloseQR} fancybox source={{uri:`${CONTENT_URL}/qr/url/${result.custom}`}} fullSize contentWidth={200} animated={false} forceFancybox />
                            </View>
                            <Text category="h5" style={{marginVertical:10}}>{result.status==0 ? "URL has been successfully shortened." : "URL already been shortened by others."}</Text>
                            <Text><Text>Short URL: </Text><Text status="info" style={{textDecorationLine:"underline"}} onPress={()=>openBrowser(result.short_url,false)}>{result.short_url}</Text></Text>
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
                    <AdsBanners size="MEDIUM_RECTANGLE" />
                </Lay>
                <Lay style={{justifyContent:'flex-end'}}>
                    <Lay style={[style.container,{paddingVertical:5}]}>
                        <Button loading={loading} disabled={loading} onPress={handleSubmit}>Submit</Button>
                    </Lay>
                </Lay>
            </Lay>
            <Portal>
                <Backdrop loading visible={loading} />
            </Portal>
        </Lay>
    )
})

const RenderURL=React.memo(({index,item,onMenu})=>{

    return (
        <ListItem
            key={index}
            onPress={()=>openBrowser(item?.short_url,false)}
            style={{paddingLeft:10}}
            title={()=>(
                <Text style={{fontFamily:"Inter_Medium",marginBottom:4}}>{item?.custom}</Text>
            )}
            description={(props)=>(
                <>
                    <Text style={{fontStyle:'italic',marginBottom:2,fontSize:14}}>{Ktruncate(item?.long_url,45)}</Text>
                    <Text {...props} style={{...props?.style,margin:0,marginHorizontal:0}}>{item?.date}</Text>
                </>
            )}
            accessoryRight={()=><MenuToggle onPress={()=>onMenu(index)} />}
        />
    )
})

function URLshortener({navigation}){
    const context = React.useContext(AuthContext)
    const {setNotif,state:{user}} = context
    const [open,setOpen]=React.useState(false)
    const [menu,setMenu]=React.useState(null)
    const [menuOpen,setMenuOpen]=React.useState(false)
    const [qrOpen,setQrOpen]=React.useState(false);
    const theme = useTheme()
    const [recaptcha,setRecaptcha] = React.useState("");
    const captchaRef = React.useRef(null)
    const [loading,setLoading] = React.useState(false)
    const [input,setInput]=React.useState("");
    const {PNpost} = useAPI(false)

    const {data,error,mutate,isReachingEnd,isLoadingMore,size,setSize,isValidating} = usePagination(user===false ? null : "/url/get","urls",10);

    const [refreshing,setRefreshing]=React.useState(false)

    const handleOpenQR=React.useCallback(async()=>{
        await Brightness.setBrightness(0.8);
    },[])

    const handleCloseQR=React.useCallback(async()=>{
        const system = await Brightness.getSystemBrightness();
        const brightness = system*1/16;
        await Brightness.setBrightness(brightness)
    },[])

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

    const onSubmit=React.useCallback(()=>{
        mutate();
    },[])

    const RenderHeader=React.useCallback(()=>(
        <>
            <URLshortenerForm initialData={input} setNotif={setNotif} user={user} handleOpenQR={handleOpenQR} handleCloseQR={handleCloseQR} onSubmit={onSubmit} handleDownload={handleDownload} />
            <View style={{marginVertical:25}} />
            <View>
            <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10,fontFamily:"Inter_Bold"}}>My Urls</Text>
            </View>
        </>
    ),[setNotif,user,input])

    const RenderEmpty=React.useCallback(()=>{
        if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:'100%'}}><Skeleton type="list" number={8} image /></View>
    },[error])

    const RenderFooter=React.useCallback(()=>{
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="list" height={300} number={2} image /></View> 
		else return null
    },[isReachingEnd,isLoadingMore,data])

    const onMenu=React.useCallback((i)=>{
        setMenu(data?.[i]);
        setMenuOpen(true);
    },[data])

    const openModal=React.useCallback(()=>{
        handleOpenQR();
        setQrOpen(true);
    },[])
    const closeModal=React.useCallback(()=>{
        handleCloseQR();
        setQrOpen(false);
    },[])

    const handleDownload=React.useCallback((result)=>{
        return async()=>{
            const url = `${CONTENT_URL}/qr/url/${result.custom}`
            const filename = `[portalnesia.com]_${result.custom}.png`;
            
            try {
                const down = await downloadFile(url,filename,"pn://url",`pn://second-screen?type=open_file&file=${encodeURIComponent(filename)}&mime=${encodeURIComponent('image/png')}`)
                if(down) {
                    setNotif(false,"Download","Start downloading...");
                    await down.start()
                }
            } catch(err) {
                setNotif(true,"Error",err?.message||"Something went wrong");
            }
        }
    },[])

    const confirmDelete=React.useCallback(()=>{
        Alert.alert(
            i18n.t('errors.sure'),
            `${i18n.t("remove_type",{type:menu?.custom})}?`,
            [{
                text:i18n.t('cancel'),
                onPress:()=>{}
            },{
                text:i18n.t('remove'),
                onPress:handleDelete
            }]
        )
    },[handleDelete,menu])

    const handleDelete=()=>{
        setLoading(true);
        PNpost("/url/remove",{token:menu?.token,recaptcha})
        .then(res=>{
            if(!Boolean(res.error)) {
                mutate();
                setNotif(false,res?.msg);
            }
        })
        .finally(()=>{
            setLoading(false)
            captchaRef.current?.refreshToken();
        })
    }

    React.useEffect(()=>{
        const dataListener = (data)=>{
            if(typeof data?.data === 'string' && typeof data?.mimeType === 'string') {
                if(data?.mimeType==='text/plain') {
                    setInput(data?.data);
                }
            }
        }
        ShareModule.getSharedData().then(dataListener).catch(console.log)
    },[])
    
    return (
        <>
            <Layout navigation={navigation} title="URL Shortener" withBack menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />}>
                {typeof user==='object' ? (
                    <FlatList
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor:theme['background-basic-color-1']
                        }}
                        ListHeaderComponent={RenderHeader}
                        data={data}
                        renderItem={(prop)=><RenderURL {...prop} onMenu={onMenu} />}
                        ListEmptyComponent={RenderEmpty}
                        ListFooterComponent={RenderFooter}
                        refreshControl={
                            <RefreshControl
                                colors={['white']}
                                progressBackgroundColor="#2f6f4e"
                                onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
                                refreshing={refreshing}
                            />
                        }
                        onEndReached={()=>{
                            if(!isReachingEnd && !isLoadingMore) {
                                setSize(size+1)
                            }
                        }}
                        ItemSeparatorComponent={Divider}
                    /> 
                ) : (
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor:theme['background-basic-color-1']
                        }}
                    >
                        <URLshortenerForm initialData={input} setNotif={setNotif} user={user} ads handleOpenQR={handleOpenQR} handleCloseQR={handleCloseQR} onSubmit={onSubmit} handleDownload={handleDownload} />
                    </ScrollView>
                )}
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
            <MenuContainer
                visible={menuOpen}
                onClose={()=>{setMenuOpen(false)}}
                share={{
                    link:menu?.short_url ? `${menu?.short_url}?utm_campaign=url+shortener` : '',
                    fullUrl:true
                }}
                menu={[{
                    title:"QR Code",
                    onPress:openModal
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
                    title:i18n.t('remove'),
                    onPress:confirmDelete
                }]}
            />
            <Modal
                isVisible={qrOpen}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
				coverScreen={false}
            >
				<RenderModal onClose={closeModal} menu={menu} handleDownload={handleDownload} />
			</Modal>
            <Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} />
            <Backdrop loading visible={loading} />
        </>
    )
}
export default React.memo(URLshortener)