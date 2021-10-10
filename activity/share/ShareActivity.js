import React from 'react'
import {View,ScrollView,ToastAndroid} from 'react-native';
import {Layout as Lay, Text,Icon,Spinner,useTheme} from '@ui-kitten/components'
import i18n from 'i18n-js'
import * as Secure from 'expo-secure-store'
import ShareModule from '@pn/module/Share'
import Layout from '@pn/components/global/Layout'
import ListItem from '@pn/components/global/ListItem'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';

import TopNavigationAction from '@pn/components/navigation/TopAction'
import TopNav from '@pn/components/navigation/TopNav'
import BaseActivity from '../BaseActivity'
import Backdrop from '@pn/components/global/Backdrop';
import {ImageFull as Image} from '@pn/components/global/Image';
import { isTwitterURL, isURL, extractMeta } from '@portalnesia/utils';
import TopAction from '@pn/components/navigation/TopAction'
import {Portal} from'@gorhom/portal'
import { Modalize } from 'react-native-modalize';
import useAPI from '@pn/utils/API'
import Recaptcha from '@pn/components/global/Recaptcha'

const CloseIcon=(props)=>(
	<Icon {...props} name='close' />
)
const SendIcon = (props)=><Icon {...props} name="send" pack="material" />

const Header = React.memo(()=>{
    const theme=useTheme();
    return (
        <Lay style={{padding:5,paddingVertical:15,borderTopLeftRadius:15,borderTopRightRadius:15}}>
            <View style={{alignItems:'center',justifyContent:'center'}}>
                <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
            </View>
        </Lay>
    )
})

const RenderMenu=React.memo(({item,index,onPress})=>{
    return (
        <ListItem key={index.toString()} style={{paddingVertical:5}} title={()=><Text style={{fontSize:15,marginHorizontal:10}}>{item?.text}</Text>} onPress={()=>onPress(item)} />
    )
})

const ModalMenu=React.memo(({action,onPress,menu,onCloseMenu})=>{
    const theme=useTheme();
    const modalRef=React.useRef(null);

    React.useEffect(()=>{
        if(menu) modalRef.current?.open();
    },[menu])

    const onPressed=React.useCallback((item)=>{
        if(onPress) onPress(item);
        setTimeout(()=>modalRef.current?.close());
    },[onPress])

    return (
        <Portal>
            <Modalize
                modalStyle={{
                    backgroundColor:theme['background-basic-color-1'],
                    borderTopLeftRadius:15,borderTopRightRadius:15
                }}
                adjustToContentHeight
                withHandle={false}
                ref={modalRef}
                flatListProps={{
                    data:action,
                    ListHeaderComponent:<Header />,
                    renderItem:(props)=><RenderMenu {...props} onPress={onPressed} />,
                    keyExtractor:(_,i)=>i.toString(),
                    contentContainerStyle:{paddingBottom:15}
                }}
                onClosed={onCloseMenu}
            />
        </Portal>
    )
})

const ShareText=React.memo(({data,user,token,menu,onCloseMenu})=>{
    const modalRef=React.useRef(null);

    const action = React.useMemo(()=>{
        const dt = [{
            text:"Parse HTML",
            url:"pn://parse-html"
        }]
        if(isURL(data?.data)) {
            dt.push({text:"URL Shortener",url:"pn://url"},{text:"Images Checker",url:"pn://images-checker"});
            if(isTwitterURL(data?.data)) {
                dt.push({text:"Twitter Thread Reader",url:"pn://twitter/thread"})
            }
        }
        return dt;
    },[data])

    const onPress=React.useCallback((item)=>{
        ShareModule.continueInApp(data?.mimeType,data?.data,{url:item.url});
        setTimeout(()=>modalRef.current?.close());
    },[data])

    return (
        <>
            <Lay style={{paddingHorizontal:15,paddingVertical:25}}>
                <Lay>
                    <Text style={{marginBottom:10}}>Shared data:</Text>
                    <Text>{data?.data}</Text>
                </Lay>
            </Lay>
            <ModalMenu action={action} onCloseMenu={onCloseMenu} onPress={onPress} menu={menu} />
        </>
    )
})

const ShareImage=React.memo(({data,user,token,menu,onCloseMenu})=>{
    const {PNpost,cancelPost} = useAPI();
    const [loading,setLoading] = React.useState(false);
    const [progress,setProgress] = React.useState(0);
    const captchaRef = React.useRef(null);

    const action = React.useMemo(()=>{
        const dt = [{
            text:"Images Checker",
            url:"pn://images-checker"
        }]
        if(token!==null) {
            dt.push({text:"Change Profile Picture",key:'profile'});
        }
        return dt;
    },[token])

    const handleChangeProfile=React.useCallback(async(image)=>{
        setProgress(0);
        setLoading(true);
        try {
            const opt={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:function(progEvent){
                    const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                    setProgress(complete);
                }
            }
            const form = new FormData();
            const {name,match} = extractMeta(image);

            form.append('image',{uri:image,name,type:`image/${match[1]}`});
            form.append('image_name',name);
            const recaptcha = await captchaRef.current.getToken();
            form.append('recaptcha',recaptcha);
            console.log(user,user?.username)
            const res = await PNpost(`/user/${user?.username}/edit`,form,opt,true,false)
            if(!Boolean(res?.error)) {
                ShareModule.dismiss();
            }
        } catch(e) {
            console.log(e);
            ToastAndroid.show(e?.message||i18n.t("errors.general"),ToastAndroid.LONG);
        } finally {
            setProgress(0)
            setLoading(false);
        }
    },[PNpost,user])

    const cancelRequest=React.useCallback(()=>{
        cancelPost();
        setProgress(0)
        setLoading(false);
    },[cancelPost])

    const onPress=React.useCallback(async(item)=>{
        if(!item?.key) return ShareModule.continueInApp(data?.mimeType,data?.data,{url: item.url,...item?.extraData});
        
        let type = data?.data?.match(/\.(\S{3,4})$/ig)
        type = type[0].substring(1);
        
        if(['jpg','jpeg','png'].indexOf(type) !== -1) {
            try {
                const crop = await ShareModule.startCropActivity(type,data?.data,{aspect:[500,500]});
                if(typeof crop?.uri === 'string') handleChangeProfile(crop?.uri);
            } catch(e) {
                console.log("Crop error",e)
            }
        }
    },[data])

    return (
        <>
            <Lay style={{paddingHorizontal:15,paddingVertical:25}}>
                <Lay>
                    <Text style={{marginBottom:10}}>Shared data:</Text>
                    <Image source={{uri:data?.data}} fancybox forceFancybox />
                </Lay>
            </Lay>
            <ModalMenu action={action} onCloseMenu={onCloseMenu} onPress={onPress} menu={menu} />
            <Backdrop
                visible={loading}
                progress={progress}
                text={progress<100 ? "Uploading..." : "Processing..."}
                onCancel={cancelRequest}
            />
            <Recaptcha ref={captchaRef} />
        </>
    )
})

function Share(){
    const [data,setData]=React.useState(null);
    const [user,setUser]=React.useState(null);
    const [token,setToken] = React.useState(null);
    const theme=useTheme();
    const [menu,setMenu]=React.useState(false);

    const onCloseMenu=React.useCallback(()=>{
        setMenu(false)
    },[])

    React.useEffect(()=>{
        Promise.all([Secure.getItemAsync("user"),Secure.getItemAsync("token")])
        .then(([user,token])=>{
            //console.log("USER",user,token);
            if(user !== null) {
                setUser(JSON.parse(user));
            } else {
                setUser(false);
            }
            if(token !== null) {
                setToken(JSON.parse(token));
            }
            return Promise.resolve();
        })
        .then(()=>ShareModule.getSharedData(false))
        .then(data=>{
            console.log(data)
            setData(data)
        })
        .catch(e=>{
            console.log(e);
        })
    },[])

    const handleBack=React.useCallback(()=>{
        ShareModule.dismiss();
    },[])

    const accessoryLeft=React.useCallback(()=>{
        return <TopNavigationAction tooltip={i18n.t('close')} icon={CloseIcon} onPress={handleBack} />
    },[])

    const Header=React.useMemo(()=>(
        <TopNav title="Portalnesia Share" accessoryLeft={accessoryLeft} align="center" menu={()=><TopAction icon={SendIcon} tooltip={i18n.t('send')} onPress={()=>setMenu(true)} />} />
    ),[])
    
    return (
        <BaseActivity>
            <Layout custom={Header} whiteBg>
                {(data===null || user===null) ? (
                    <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Spinner size="large" />
                    </Lay>
                ) : (
                    <ScrollView
                        contentContainerStyle={{flexGrow:1,backgroundColor:theme['background-basic-color-1']}}
                    >
                        {data?.mimeType==='text/plain' ? (
                            <ShareText data={data} user={user} token={token} menu={menu} onCloseMenu={onCloseMenu} />
                        ) : data?.mimeType?.match(/^image\/+/) ? (
                            <ShareImage data={data} user={user} token={token} menu={menu} onCloseMenu={onCloseMenu} />
                        ) : null }
                    </ScrollView>
                )}
            </Layout>
        </BaseActivity>
    )
}

const MainStack = createStackNavigator();

export default function(){
    return (
        <NavigationContainer>
            <MainStack.Navigator initialRouteName="Share" screenOptions={{
                headerShown:false,
                gestureEnabled:true,
                ...TransitionPresets.SlideFromRightIOS
            }}>
                <MainStack.Screen name="Share" component={Share} />
            </MainStack.Navigator>
        </NavigationContainer>
    )
}