import React from 'react'
import {View,ScrollView,ToastAndroid} from 'react-native';
import {Layout as Lay, Text,Icon,Spinner,useTheme} from '@ui-kitten/components'
import i18n from 'i18n-js'
import * as Secure from 'expo-secure-store'
import ShareModule from '@pn/module/Share'
import Layout from '@pn/components/global/Layout'
import ListItem from '@pn/components/global/ListItem'

import TopNavigationAction from '@pn/components/navigation/TopAction'
import TopNav from '@pn/components/navigation/TopNav'
import BaseActivity from '../BaseActivity'
import Pressable from '@pn/components/global/Pressable';
import {ImageFull as Image} from '@pn/components/global/Image';
import { isTwitterURL, isURL } from '@pn/utils/Main';
import TopAction from '@pn/components/navigation/TopAction'
import {Portal} from'@gorhom/portal'
import { Modalize } from 'react-native-modalize';

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
    const action = React.useMemo(()=>{
        const dt = [{
            text:"Images Checker",
            url:"pn://images-checker"
        }]
        if(token===null) {
            dt.push({text:"Change Profile Picture",key:'profile'});
        }
        return dt;
    },[token])

    const handleChangeProfile=React.useCallback((data)=>{
        ToastAndroid.show("Under Maintenance",ToastAndroid.LONG);
    },[])

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
        </>
    )
})

export default function Share(){
    const [data,setData]=React.useState(null);
    const [user,setUser]=React.useState(null);
    const [token,setToken] = React.useState(null);
    const theme=useTheme();
    const [menu,setMenu]=React.useState(false);

    const onCloseMenu=React.useCallback(()=>{
        setMenu(false)
    },[])

    React.useEffect(()=>{
        Promise.all([Secure.getItemAsync("user"),Secure.getItemAsync("user")])
        .then(([user,token])=>{
            //console.log("USER",user,token);
            if(user) setUser(user);
            if(token) setToken(token);
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
            <Layout custom={Header} whiteBg >
                {data===null ? (
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