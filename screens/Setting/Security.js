import React from 'react'
import {View,Dimensions, Alert,RefreshControl,FlatList} from 'react-native'
import {Layout as Lay, Text, useTheme,Divider, Icon,Toggle,ListItem as LItem} from '@ui-kitten/components'
import i18n from 'i18n-js'
import Modal from 'react-native-modal'

import Layout from "@pn/components/global/Layout";
import Pressable from "@pn/components/global/Pressable";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from '../NotFound'
import { ucwords } from '@portalnesia/utils';
import useSWR from '@pn/utils/swr';
import Tooltip from '@pn/components/global/Tooltip'
import Recaptcha from '@pn/components/global/Recaptcha'
import Backdrop from '@pn/components/global/Backdrop'
import { useBiometrics,createKeys,promptAuthentication,deleteKeys } from '@pn/utils/Biometrics';
import useAPI from '@pn/utils/API';
import ListItem from '@pn/components/global/ListItem'
import Password from '@pn/components/global/Password'
import { MenuContainer } from '@pn/components/global/MoreMenu';
import Spinner from '@pn/components/global/Spinner'
import useSelector from '@pn/provider/actions'

const {width,height} = Dimensions.get('window')
const OptionIcon=React.memo((props)=><Icon {...props} name="more-vertical" />)

export default function SecuritySettingScreen({navigation,route}){
    const user = useSelector(state=>state.user);
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />

    const context = React.useContext(AuthContext);
    const {setNotif} = context;
    const theme=useTheme();
    const {PNpost} = useAPI();
    const {data,error,mutate,isValidating} = useSWR('/setting/security',{},true);
    const [loading,setLoading]=React.useState(false);
    const {supported:supportKey,biometricsExist} = useBiometrics();
    const [fingerprint,setFingerprint] = React.useState(undefined)
    const [session,setSession]=React.useState([]);
    const captchaRef = React.useRef(null)
    const [validate,setValidate]=React.useState(false)
    const passwordRef = React.useRef(null)
    const [menu,setMenu] = React.useState(false);
    const [selectedMenu,setSelectedMenu] = React.useState(null)
    const [modal,setModal]=React.useState(false)
    
    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    React.useEffect(()=>{
        if(data) {
            setSession(data?.sessions)
            setFingerprint(biometricsExist && data?.security_key);
        }
    },[biometricsExist,data])

    const SystemInfo=React.useMemo(()=>{
        let info = [
            {key:"Device identity",value:selectedMenu?.browser},
            {key:"Login time",value:`${selectedMenu?.date}, ${selectedMenu?.time}`},
            {key:"IP Address",value:selectedMenu?.ip_address||`null`},
            {key:"Location",value:selectedMenu?.location||`null`}
        ];
        if(selectedMenu?.info) {
            info = info.concat([
                {key:"Package version",value:selectedMenu?.info?.packageVersion ? `v${selectedMenu?.info?.packageVersion}` : `null`},
                {key:"Javascript bundle version",value:selectedMenu?.info?.jsVersion ? `v${selectedMenu?.info?.jsVersion}` : `null`},
                {key:"Device",value:selectedMenu?.info?.device||`null`},
                {key:"Build ID",value:selectedMenu?.info?.buildID||`null`},
                {key:"Build fingerprint",value:selectedMenu?.info?.buildFingerPrint||`null`},
                {key:"Model",value:selectedMenu?.info?.model||`null`},
                {key:"Product",value:selectedMenu?.info?.product||`null`},
                {key:"SDK version",value:selectedMenu?.info?.sdkVersion||`null`},
                {key:"OS version",value:selectedMenu?.info?.osVersion||`null`},
                {key:"Brand",value:selectedMenu?.info?.brand||`null`},
                {key:"Network provider",value:selectedMenu?.info?.networkProvider||`null`},
                {key:"Network MCC code",value:selectedMenu?.info?.mccCode||`null`},
                {key:"Network MNC code",value:selectedMenu?.info?.mncCode||`null`},
            ]);
        }
        return info;
    },[selectedMenu])

    const handleBiometrics=async(val)=>{
        setLoading(true);
        if(val===true) {
            try {
                const recaptcha = await captchaRef.current.getToken();
                const public_key = await createKeys();
                //console.log(public_key);
                const prompt = await promptAuthentication();
                if(prompt) {
                    const res = await PNpost(`/setting/native_keys/add`,{public_key,recaptcha})
                    if(!Boolean(res?.error)) {
                        setNotif(false,"Success",res?.msg);
                        mutate({
                            ...data,
                            security_key:true
                        })
                        setFingerprint(biometricsExist);
                    }
                }
            } catch(e){
                if(e?.message) setNotif(true,"Error",e?.message);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const recaptcha = await captchaRef.current.getToken();
                const result = await deleteKeys();
                if(result) {
                    const res = await PNpost(`/setting/native_keys/delete`,{recaptcha})
                    if(!Boolean(res?.error)) {
                        setNotif(false,"Success",res?.msg);
                        mutate({
                            ...data,
                            security_key:false
                        })
                    }
                }
                else {
                    setNotif(false,"Error","Something went wrong");
                }
            } catch(e){
                if(e?.message) setNotif(true,"Error",e?.message);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleDelete=(dt)=>{
        setLoading(true);
        captchaRef.current.getToken()
        .then(recaptcha=>{
            return PNpost(`/setting/delete_session`,{...dt,recaptcha:recaptcha,session_id:selectedMenu?.id})
        })
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
                            <Tooltip style={{marginLeft:5}} tooltip={i18n.t('settings.security.auth_help')} name="question-mark-circle-outline" />
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

    const handleRemoveMenuClick=React.useCallback(()=>{
        if(selectedMenu.this_browser) {
            setNotif(true,"Error",i18n.t('settings.security.logout'));
        } else {
            passwordRef.current?.verify()
        }
    },[selectedMenu])

    const renderIcon=React.useCallback((it,i)=>{
        return (
            <View style={{borderRadius:22,overflow:'hidden'}}>
                <Pressable style={{padding:10}} onPress={()=>{setSelectedMenu({...it,index:i}),setMenu(true)}}>
                    <OptionIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                </Pressable>
            </View>
        )
    },[theme])

    const renderEmpty=()=>{
        if(error || data?.error) return <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
        else return (
            <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Spinner size="large" />
            </Lay>
        )
    }

    return (
        <>
            <Layout navigation={navigation} title={ucwords(i18n.t('setting_type',{type:i18n.t('security')}))}>
                <FlatList
                    data={session}
                    ListEmptyComponent={renderEmpty}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{backgroundColor:theme['background-basic-color-1'],paddingTop:15,...(session.length === 0 ? {flex:1} : {})}}
                    ListHeaderComponent={renderHeader}
                    renderItem={(props)=> <RenderItem {...props} renderIcon={renderIcon} />}
                    ItemSeparatorComponent={Divider}
                    keyExtractor={(_,i)=>i.toString()}
                    { ...(typeof data !== 'undefined' || typeof error !== 'undefined' ? {refreshControl:<RefreshControl refreshing={validate && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>{!validate && (setValidate(true),mutate())}} colors={['white']} progressBackgroundColor="#2f6f4e" />} : {}) }
                />
            </Layout>
            <Backdrop visible={loading} loading />
            <Recaptcha ref={captchaRef} />
            <Password supported={fingerprint} loading={loading} ref={passwordRef} onSubmit={handleDelete} />
            
            <Modal
                isVisible={modal}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
				<RenderModal onClose={()=>setModal(false)} theme={theme} systemInfo={SystemInfo} />
			</Modal>
            
            <MenuContainer
                visible={menu}
                onClose={()=>setMenu(false)}
                menu={[
                    {
                        title:i18n.t('remove'),
                        onPress:handleRemoveMenuClick,
                        icon:"trash",
                        color:theme['color-danger-500']
                    },
                    {
                        title:"Detail",
                        onPress:()=>setModal(true),
                        icon:"info"
                    }
                ]}
            />
        </>
    )
}

const RenderItem=React.memo(({item,index,renderIcon})=>{
    const theme = useTheme();
    const renderDesc=(props)=>{
        return (
            <>
                <Text {...props}>{`${item?.date}, ${item?.time}`}</Text>
                <Text {...props}>{`${item?.ip_address}`}</Text>
                {item?.location && <Text {...props}>{item?.location}</Text> }
                {item?.this_browser && <Text style={{color:theme['color-indicator-bar'],marginHorizontal:8,fontSize:14,fontFamily:'Inter_Bold'}} >This device</Text>}
            </>
        )
    }

    return (
        <ListItem disabled key={index.toString()} title={item?.browser} description={renderDesc} style={{paddingVertical:5}} accessoryRight={()=>renderIcon(item,index)} />
    )
})

const RenderModal=React.memo(({onClose,theme,systemInfo})=>{
    return (
        <Lay style={{padding:10,width:width-20,borderRadius:10}}>
			<View style={{marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
				<Text>Detail</Text>
				<View style={{borderRadius:22,overflow:'hidden'}}>
					<Pressable style={{padding:10}} onPress={()=> onClose && onClose()}>
						<Icon style={{width:24,height:24,tintColor:theme['text-hint-color']}} name="close-outline" />
					</Pressable>
				</View>
			</View>
            <Divider style={{backgroundColor:theme['border-text-color']}} />
            <View style={{marginTop:10,maxHeight:height-155}}>
                <FlatList
                    data={systemInfo}
                    renderItem={(props) => <RenderDetail {...props}/> }
                />
            </View>
        </Lay>
    )
})

const RenderDetail=React.memo(({item,index:i})=>{
    return (
        <LItem key={i} title={item?.key} description={item?.value} disabled />
    )
})
