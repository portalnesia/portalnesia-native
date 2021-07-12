import React from 'react'
import {View,Dimensions, Alert,RefreshControl,FlatList} from 'react-native'
import {Layout as Lay, Text,Input,Select,SelectItem,IndexPath,Datepicker, useTheme,Divider, Icon,Toggle} from '@ui-kitten/components'
import i18n from 'i18n-js'
import {startActivityAsync,ACTION_APP_NOTIFICATION_SETTINGS} from 'expo-intent-launcher'

import Layout from "@pn/components/global/Layout";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from '../NotFound'
import useSWR from '@pn/utils/swr';
import useUnsaved from '@pn/utils/useUnsaved'
import Recaptcha from '@pn/components/global/Recaptcha'
import useAPI from '@pn/utils/API';
import Tooltip from '@pn/components/global/Tooltip'
import { ucwords } from '@pn/utils/Main';
import ListItem from '@pn/components/global/ListItem'
import Button from '@pn/components/global/Button'
import Spinner from '@pn/components/global/Spinner'

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const notifTitle=()=>({
    notif_news:i18n.t("news"),
    notif_comment:ucwords(i18n.t("comment",{count:1})),
    notif_birthday:i18n.t("form.birthday"),
    notif_message:i18n.t("form.message"),
    notif_feature:i18n.t("settings.notification.title_feature"),
    email_birthday:i18n.t("form.birthday"),
    email_komentar:ucwords(i18n.t("comment",{count:1})),
    email_feature:i18n.t("settings.notification.title_feature")
})

const notifHelp=()=>({
    notif_news:i18n.t("settings.notification.notif_news"),
    notif_comment:i18n.t("settings.notification.notif_comment"),
    notif_birthday:i18n.t("settings.notification.notif_birthday"),
    notif_message:i18n.t("settings.notification.notif_message"),
    notif_feature:i18n.t("settings.notification.notif_feature"),
    email_birthday:i18n.t("settings.notification.email_birthday"),
    email_komentar:i18n.t("settings.notification.email_komentar"),
    email_feature:i18n.t("settings.notification.email_feature")
})

export default function NotificationSettingScreen({navigation,route}){
    const context = React.useContext(AuthContext);
    const {setNotif,state:{user}} = context;
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />
    const {data,error,mutate,isValidating} = useSWR('/setting/notification',{},true);
    const [input,setInput] = React.useState({notif_news:true,notif_comment:true,notif_birthday:true,notif_message:true,notif_feature:true,email_birthday:true,email_komentar:true,email_feature:true});
    const setCanBack = useUnsaved(true);
    const [recaptcha,setRecaptcha] = React.useState("");
    const captchaRef = React.useRef(null)
    const [validate,setValidate]=React.useState(false)
    const [loading,setLoading]=React.useState(false);
    const {PNpost} = useAPI();

    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    const notification=React.useMemo(()=>{
        if(data?.notification) {
            const title = notifTitle();
            const help = notifHelp();
            const notif = Object.keys(data?.notification).map((k)=>{
                return {
                    key:k,
                    title:title?.[k],
                    help:help?.[k]
                }
            })
            notif.unshift({
                key:'device',
                title:ucwords(i18n.t("notification_type",{type:i18n.t('device')})),
                help:""
            })
            return notif;
        }
        return [];
    },[data]);

    React.useEffect(()=>{
        if(data?.notification) setInput(data?.notification);
    },[data])

    const handleChange=(type)=>(val)=>{
        if(val === data?.notification?.[type]) setCanBack(true)
        else setCanBack(false)
        setInput(prev=>({...prev,[type]:val}))
    }

    const renderEmpty=()=>{
        if(error || data?.error) return <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
        else return (
            <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Spinner size="large" />
            </Lay>
        )
    }

    const handleSubmit=()=>{
        setLoading(true)
        PNpost('/setting/notification',{...input,recaptcha})
        .then((res)=>{
            if(!Boolean(res?.error)) {
                setNotif(false,"Success",res?.msg);
                mutate({
                    ...data,
                    notification:input
                })
                setCanBack(true);
            }
        })
        .finally(()=>{
            setLoading(false);
            captchaRef.current?.refreshToken();
        })
    }

    const renderFooter=()=>{
        if(data?.notification) {
            return (
                <Lay level="2" style={{paddingTop:30,paddingBottom:10,paddingHorizontal:15}}>
                    <Button loading={loading} disabled={loading} onPress={handleSubmit}>{ucwords(i18n.t('save'))}</Button>
                </Lay>
            )
        }
        return null;
    }

    return (
        <>
        <Layout navigation={navigation} title={ucwords(i18n.t('setting_type',{type:i18n.t('notification',{count:2})}))}>
            <FlatList
                data={notification}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{...(notification?.length === 0 ? {flex:1} : {})}}
                renderItem={(props)=> <RenderItem {...props} input={input} handleChange={handleChange} loading={loading} />}
                ItemSeparatorComponent={Divider}
                { ...(typeof data !== 'undefined' || typeof error !== 'undefined' ? {refreshControl:<RefreshControl refreshing={validate && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>{!validate && (setValidate(true),mutate())}} colors={['white']} progressBackgroundColor="#2f6f4e" />} : {}) }
            />
        </Layout>
        <Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} />
        </>
    )
}

const RenderItem=React.memo(({item,index,input,handleChange,loading})=>{
    const theme=useTheme();

    const handleDeviceNotification=React.useCallback(async()=>{
        await startActivityAsync(ACTION_APP_NOTIFICATION_SETTINGS,{extra:{"android.provider.extra.APP_PACKAGE":"com.portalnesia.app"}});
    },[])

    if(item?.key==='device') {
        return (
            <Lay>
                <ListItem style={{margin:0,paddingHorizontal:5,paddingVertical:3}} title={()=><Text>{item?.title}</Text>} accessoryRight={ForwardIcon} onPress={handleDeviceNotification} />
            </Lay>
        )
    }

    return (
        <React.Fragment key={item?.key}>
            {(index === 1 || index === 6) && (
                <Lay level="2" style={{paddingTop:20,paddingBottom:10}}>
                    <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t("notification_type",{type:(index===1 ? "Push" : "Email")}))}</Text>
                </Lay>
            )}
            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                <View style={{flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'space-between'}}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Text>{item?.title}</Text>
                        <Tooltip style={{marginLeft:5}} tooltip={item?.help} name="question-mark-circle-outline" />
                    </View>
                    <Toggle disabled={loading} checked={input?.[item?.key]} onChange={handleChange(item?.key)} />
                </View>
            </Lay>
        </React.Fragment>
    )
})