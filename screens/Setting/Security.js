import React from 'react'
import {ScrollView,View,Dimensions, Alert,RefreshControl,FlatList} from 'react-native'
import {Layout as Lay, Text,Input,Select,SelectItem,IndexPath,Datepicker, useTheme,Spinner,Divider, Icon,Toggle} from '@ui-kitten/components'
import i18n from 'i18n-js'

import Layout from "@pn/components/global/Layout";
import Pressable from "@pn/components/global/Pressable";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from '../NotFound'
import { ucwords } from '@pn/utils/Main';
import useSWR from '@pn/utils/swr';
import {CONTENT_URL,ACCOUNT_URL} from '@env'
import Tooltip from '@pn/components/global/Tooltip'
import Recaptcha from '@pn/components/global/Recaptcha'
import Backdrop from '@pn/components/global/Backdrop'
import { useBiometrics,createKeys,promptAuthentication,deleteKeys } from '@pn/utils/Biometrics';
import useAPI from '@pn/utils/API';
import ListItem from '@pn/components/global/ListItem'
import Password from '@pn/components/global/Password'
import { MenuContainer } from '@pn/components/global/MoreMenu';

const OptionIcon=React.memo((props)=><Icon {...props} name="more-vertical" />)

export default function SecuritySettingScreen({navigation,route}){
    const context = React.useContext(AuthContext);
    const {setNotif,state:{user}} = context;
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />
    const theme=useTheme();
    const {PNpost} = useAPI();
    const {data,error,mutate,isValidating} = useSWR('/setting/security',{},true);
    const [loading,setLoading]=React.useState(false);
    const {supported:supportKey,biometricsExist} = useBiometrics();
    const [fingerprint,setFingerprint] = React.useState(undefined)
    const [session,setSession]=React.useState([]);
    const [recaptcha,setRecaptcha] = React.useState("");
    const captchaRef = React.useRef(null)
    const [validate,setValidate]=React.useState(false)
    const passwordRef = React.useRef(null)
    const [menu,setMenu] = React.useState(false);
    const [selectedMenu,setSelectedMenu] = React.useState(null)
    
    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    React.useEffect(()=>{
        if(data) {
            //console.log(data);
            setSession(data?.sessions)
            setFingerprint(biometricsExist && data?.security_key);
        }
    },[biometricsExist,data])

    const handleBiometrics=async(val)=>{
        setLoading(true);
        if(val===true) {
            try {
                const public_key = await createKeys();
                //console.log(public_key);
                const prompt = await promptAuthentication();
                if(prompt) {
                    const res = await PNpost(`/setting/native_keys/add`,{public_key,recaptcha})
                    if(!Boolean(res?.error)) {
                        setFingerprint(true);
                        setNotif(false,"Success",res?.msg);
                    }
                }
            } catch(e){
                if(e?.message) setNotif(true,"Error",e?.message);
            } finally {
                setLoading(false);
                captchaRef.current?.refreshToken();
            }
        } else {
            try {
                const result = await deleteKeys();
                if(result) {
                    const res = await PNpost(`/setting/native_keys/delete`,{recaptcha})
                    if(!Boolean(res?.error)) {
                        setNotif(false,"Success",res?.msg);
                        setFingerprint(false);
                    }
                }
                else {
                    setNotif(false,"Error","Something went wrong");
                }
            } catch(e){
                if(e?.message) setNotif(true,"Error",e?.message);
            } finally {
                setLoading(false);
                captchaRef.current?.refreshToken();
            }
        }
    }

    const handleDelete=(dt)=>{
        setLoading(true);
        PNpost(`/setting/delete_session`,{...dt,recaptcha:recaptcha,session_id:selectedMenu?.id})
        .then((res)=>{
            if(!Boolean(res?.error)) {
                passwordRef.current?.closeModal();
                setNotif(false,"Success",res?.msg);
                if(typeof selectedMenu?.index !== 'undefined') {
                    const aa=[...session];
                    aa.splice(Number(selectedMenu?.index),1)
                    mutate({
                        ...data,
                        sessions:aa
                    })
                }
            }
        })
        .finally(()=>{
            setLoading(false);
            captchaRef.current?.refreshToken();
        })
    }

    const renderHeader=()=>(
        <Lay>
            {supportKey && (
                <>
                <Lay style={{marginVertical:15}}>
                    <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t('authentication'))}</Text>
                    <View style={{paddingHorizontal:15,flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text>{ucwords(i18n.t('auth_type',{type:ucwords(i18n.t('fingerprint'))}))}</Text>
                            {/*<Tooltip style={{marginLeft:5}} tooltip={i18n.t('settings.account.private_tip')} name="question-mark-circle-outline" />*/}
                        </View>
                        <Toggle disabled={loading} checked={fingerprint} onChange={handleBiometrics} />
                    </View>
                </Lay>
                {session.length > 0 && (
                    <Lay style={{paddingTop:15}}>
                        <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t('session',{count:2}))}</Text>
                    </Lay>
                )}
                </>
            )}
        </Lay>
    )

    const renderIcon=React.useCallback((it,i)=>(
        <View style={{borderRadius:22,overflow:'hidden'}}>
            <Pressable style={{padding:10}} onPress={()=>{setSelectedMenu({...it,index:i}),setMenu(true)}}>
                <OptionIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
            </Pressable>
        </View>
    ),[theme])

    return (
        <>
            <Layout navigation={navigation} title={ucwords(i18n.t('setting_type',{type:i18n.t('security')}))}>
                {(!data && !error) || typeof fingerprint === 'undefined' ? (
                    <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Spinner size="large" />
                    </Lay>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : (
                    <ScrollView contentContainerStyle={{flexGrow:1}} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
                        <FlatList
                            data={session}
                            contentContainerStyle={{backgroundColor:theme['background-basic-color-1'],paddingTop:15}}
                            ListHeaderComponent={renderHeader}
                            renderItem={(props)=> <RenderItem {...props} renderIcon={renderIcon} />}
                            ItemSeparatorComponent={Divider}
                            refreshControl={
                                <RefreshControl
                                    refreshing={validate}
                                    onRefresh={()=>{
                                        if(!validate) {
                                            setValidate(true);
                                            mutate();
                                        }
                                    }}
                                    colors={['white']} progressBackgroundColor="#2f6f4e"
                                />
                            }
                            keyExtractor={(_,i)=>i.toString()}
                        />
                    </ScrollView>
                )}
                
            </Layout>
            <Backdrop visible={loading} loading />
            <Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} />
            <Password supported={fingerprint} loading={loading} ref={passwordRef} onSubmit={handleDelete} />
            <MenuContainer
                visible={menu}
                onClose={()=>setMenu(false)}
                menu={[
                    {
                        title:i18n.t('remove'),
                        onPress:()=>passwordRef.current?.verify()
                    }
                ]}
            />
        </>
    )
}

const RenderItem=React.memo(({item,index,renderIcon})=>{

    const renderDesc=(props)=>{
        return (
            <>
                <Text {...props}>{`${item?.date}, ${item?.time}`}</Text>
                <Text {...props}>{`${item?.ip_address}`}</Text>
                {item?.location && <Text {...props}>{item?.location}</Text> }
                {item?.this_browser && <Text style={{marginHorizontal:8,fontSize:12,fontFamily:'Inter_Bold'}} >This device</Text>}
            </>
        )
    }

    return (
        <ListItem disabled key={index.toString()} title={item?.browser} description={renderDesc} style={{paddingVertical:5}} accessoryRight={()=>renderIcon(item,index)} />
    )
})