import React from 'react'
import {ScrollView,View,Dimensions, Alert,RefreshControl} from 'react-native'
import {Layout as Lay, Text,Input,Select,SelectItem,IndexPath,Datepicker, useTheme,Spinner,Divider, Icon,Toggle} from '@ui-kitten/components'
import i18n from 'i18n-js'
import FastImage from 'react-native-fast-image'
import Modal from 'react-native-modal'

import Layout from "@pn/components/global/Layout";
import Button from "@pn/components/global/Button";
import Pressable from "@pn/components/global/Pressable";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from '../NotFound'
import { openBrowser, ucwords } from '@pn/utils/Main';
import useSWR from '@pn/utils/swr';
import {CONTENT_URL,ACCOUNT_URL} from '@env'
import useUnsaved from '@pn/utils/useUnsaved'
import Tooltip from '@pn/components/global/Tooltip'
import Recaptcha from '@pn/components/global/Recaptcha'
import Password from '@pn/components/global/Password'
import { useBiometrics,createKeys,verifyAuthentication,promptAuthentication,deleteKeys } from '@pn/utils/Biometrics';
import useAPI from '@pn/utils/API'

const {width} = Dimensions.get('window')

export default function AccountSettingScreen({navigation,route}){
    const msg = route?.params?.msg;
    const context = React.useContext(AuthContext);
    const {setNotif,state:{user}} = context;
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />
    const theme=useTheme();
    const {data,error,mutate,isValidating} = useSWR('/setting/account',{},true);
    const [input,setInput]=React.useState({email:'',google:'',instagram:'',line:'',media_private:false,private:false,telegram:'',twitter:'',username:''})
    const [validate,setValidate]=React.useState(false)
    const [loading,setLoading]=React.useState(false);
    const [fingerprint,setFingerprint] = React.useState(false)
    const {PNpost} = useAPI()
    const setCanBack = useUnsaved(true);
    const {supported:supportKey,biometricsExist} = useBiometrics();
    const [dialog,setDialog] = React.useState(null);
    const [password,setPassword]=React.useState("");
    const [newPassword,setNewPassword]=React.useState({newpassword:'',cpassword:''});
    const [recaptcha,setRecaptcha] = React.useState("");
    const captchaRef = React.useRef(null)
    const passwordRef = React.useRef(null)

    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    React.useEffect(()=>{
        if(typeof msg==='string') mutate();
    },[msg])

    React.useEffect(()=>{
        if(data) {
            //console.log(data)
            setInput(data?.users);
            setFingerprint(Boolean(data?.security_key && supportKey && biometricsExist));
        }
    },[data,supportKey,biometricsExist])

    const handleChange=(type)=>(val)=>{
        if(val === data?.users?.[type]) setCanBack(true)
        else setCanBack(false)
        setInput(prev=>({...prev,[type]:val}))
    }

    const confirmUnlink=(type)=>()=>{
        const link = `${ACCOUNT_URL}/${type}/logout?redirect=${encodeURIComponent(`pn://setting/account`)}`
        Alert.alert(
            i18n.t('errors.sure'),
            `${i18n.t('settings.account.unlink',{type})}\n${input?.[type]}`,
            [{
                text:"Cancel",
                onPress:()=>{}
            },{
                text:"Unlink",
                onPress:()=>openBrowser(link,false)
            }]
        )
    }

    const confirmSave=()=>{
        if(input?.username?.match(/\S+/)===null) return setNotif(true,"Error","Username cannot be empty");
        if((/^w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/).test(input.email) === false) return setNotif(true,"Error","Invalid email");
        let changed=[];
        if(data?.users?.username !== input.username) changed.push(`- ${i18n.t('change_type',{type:"username"})}`);
        if(data?.users?.email !== input.email) changed.push(`- ${i18n.t('change_type',{type:i18n.t('form.email')})}`);

        if(changed.length > 0) {
            Alert.alert(
                "Warning",
                `${changed.join("\n")}`,
                [{
                    text:i18n.t('cancel'),
                    onPress:()=>{}
                },{
                    text:ucwords(i18n.t("save")),
                    onPress:withFingerprint
                }]
            )
        } else withFingerprint();
    }

    const withFingerprint=()=>{
        passwordRef.current?.verify();
    }

    const handleSubmit=(dt)=>{
        if(dt?.password?.match(/\S+/)===null) return setNotif(true,"Error","Password cannot be empty");
        setLoading(true)
        const daa = {...input,...dt,recaptcha}
        PNpost('/setting/general',daa)
        .then(res=>{
            if(!Boolean(res?.error)) {
                setCanBack(true);
                setNotif(false,"Success",res?.msg);
                setDialog(null);
                setPassword("");
                mutate();
                passwordRef.current?.closeModal();
            }
        })
        .finally(()=>{
            setLoading(false)
            captchaRef.current?.refreshToken();
        })
    }

    const confirmDelete=()=>{
        const text=[
            `- ${i18n.t('settings.account.delete.one')}`,
            `- ${i18n.t('settings.account.delete.two')}`,
            `- ${i18n.t('settings.account.delete.three')}`
        ];
        Alert.alert(
            "Warning",
            `${text.join("\n\n")}`,
            [{
                text:i18n.t('cancel'),
                onPress:()=>{}
            },{
                text:ucwords(i18n.t("settings.account.deactivate")),
                onPress:handleDelete
            }]
        )
    }

    const handleDelete=()=>{
        console.log("Delete");
    }

    React.useEffect(()=>{
        if(dialog===null) {
            setPassword("");
            setNewPassword({newpassword:"",cpassword:''})
        }
    },[dialog])

    return (
        <>
        <Layout navigation={navigation} title={ucwords(i18n.t('setting_type',{type:i18n.t('account',{count:1})}))}>
            <ScrollView contentContainerStyle={{...(!data && !error ? {flex:1} : {flexGrow:1})}} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                { ...(typeof data !== 'undefined' || typeof error !== 'undefined' ? {refreshControl:<RefreshControl refreshing={validate && (typeof data !== 'undefined' || typeof error !== 'undefined')} onRefresh={()=>{!validate && (setValidate(true),mutate())}} colors={['white']} progressBackgroundColor="#2f6f4e" />} : {}) }    
            >
                {!data && !error ? (
                    <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Spinner size="large" />
                    </Lay>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : (
                    <Lay style={{paddingVertical:15}}>
                        <Lay style={{marginVertical:15}}>
                            <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t('account',{count:1}))}</Text>
                            <Lay style={{paddingHorizontal:15}}>
                                <Input
                                    label={i18n.t('form.username')}
                                    value={input.username}
                                    onChangeText={handleChange('username')}
                                    autoCompleteType="username"
                                    textContentType="username"
                                    disabled={loading}
                                />
                            </Lay>
                            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                                <Input
                                    label={i18n.t('form.email')}
                                    value={input.email}
                                    onChangeText={handleChange('email')}
                                    autoCompleteType="email"
                                    textContentType="emailAddress"
                                    disabled={loading}
                                />
                            </Lay>
                        </Lay>

                        <Lay style={{paddingVertical:15}}>
                            <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t('privacy'))}</Text>
                            <Lay style={{paddingHorizontal:15}} >
                                <View style={{flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <Text>{i18n.t('settings.account.private')}</Text>
                                        <Tooltip style={{marginLeft:5}} tooltip={i18n.t('settings.account.private_tip')} name="question-mark-circle-outline" />
                                    </View>
                                    <Toggle disabled={loading} checked={input.private} onChange={handleChange('private')} />
                                </View>
                            </Lay>
                            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                                <View style={{flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <Text>{i18n.t('settings.account.media_private')}</Text>
                                        <Tooltip style={{marginLeft:5}} tooltip={i18n.t('settings.account.media_private_tip')} name="question-mark-circle-outline" />
                                    </View>
                                    <Toggle disabled={loading} checked={input.media_private} onChange={handleChange('media_private')} />
                                </View>
                            </Lay>
                        </Lay>

                        <Lay style={{paddingVertical:15}}>
                            <Text category="h5" style={{paddingHorizontal:15,paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{ucwords(i18n.t('social_media'))}</Text>
                            <Lay style={{paddingHorizontal:15}}>
                                <Input
                                    label="Instagram"
                                    value={input.instagram}
                                    onChangeText={handleChange('instagram')}
                                    autoCompleteType="username"
                                    textContentType="username"
                                    disabled={loading}
                                    caption="Without @"
                                />
                            </Lay>
                            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                                <Input
                                    label="Line"
                                    value={input.line}
                                    onChangeText={handleChange('line')}
                                    autoCompleteType="username"
                                    textContentType="username"
                                    disabled={loading}
                                    caption="Without @"
                                />
                            </Lay>
                            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                                <Text appearance="hint" category="label" style={{marginBottom:5}}>Google</Text>
                                {input?.google===null ? (
                                    <Pressable default onPress={()=>openBrowser(`${ACCOUNT_URL}/google/link?redirect=${encodeURIComponent('pn://setting/account')}`,false)}><FastImage source={{uri:`${CONTENT_URL}/social-logo/google-sign-logo.png`}} style={{width:158,height:28}} /></Pressable>
                                ) : (
                                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                        <Text>{input?.google}</Text>
                                        <Text style={{fontSize:13,textDecorationLine:"underline"}} status="info" onPress={confirmUnlink('google')} >Unlink</Text>
                                    </View>
                                )}
                            </Lay>
                            <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                                <Text appearance="hint" category="label" style={{marginBottom:5}}>Twitter</Text>
                                {input?.twitter===null ? (
                                    <Pressable default onPress={()=>openBrowser(`${ACCOUNT_URL}/twitter/login?redirect=${encodeURIComponent('pn://setting/account')}`,false)}><FastImage source={{uri:`${CONTENT_URL}/social-logo/twitter-sign-logo.png`}} style={{width:158,height:28}} /></Pressable>
                                ) : (
                                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                        <Text>{input?.twitter}</Text>
                                        <Text style={{fontSize:13,textDecorationLine:"underline"}} status="info" onPress={confirmUnlink('twitter')}>Unlink</Text>
                                    </View>
                                )}
                            </Lay>
                        </Lay>
                        <Divider style={{backgroundColor:theme['border-text-color'],marginVertical:10}} />
                        <Lay style={{paddingHorizontal:15,paddingTop:10}}>
                            {/*<Button disabled={loading} text onPress={()=>setDialog('change_password')}>{i18n.t('settings.account.change_password')}</Button>
                            <Button disabled={loading} onPress={confirmDelete} status="danger" style={{marginVertical:15}}>{i18n.t('settings.account.deactivate')}</Button>*/}
                            <Button disabled={loading} loading={loading} onPress={confirmSave}>{ucwords(i18n.t("save"))}</Button>
                        </Lay>
                    </Lay>
                )}
            </ScrollView>
        </Layout>

        <Modal
            isVisible={dialog!==null}
            style={{margin:0,justifyContent:'center',alignItems:'center'}}
            animationIn="fadeIn"
            animationOut="fadeOut"
            coverScreen={false}
        >
            <Lay style={{padding:10,width:width-60,borderRadius:10,paddingVertical:15}}>
                <View style={{marginBottom:15}}>
                    <Text category="h5" style={{paddingBottom:5,borderBottomColor:theme['border-text-color'],borderBottomWidth:2,marginBottom:10}}>{dialog==='change_password' ? 'Change Password' : ''}</Text>
                </View>
                { dialog==='change_password' ? (
                    <View>
                        <View style={{marginBottom:15}}>
                            <Input
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                label="Old Password"
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={{marginBottom:15}}>
                            <Input
                                value={newPassword.newpassword}
                                onChangeText={(pass)=>setNewPassword(prev=>({...prev,newpassword:pass}))}
                                secureTextEntry
                                label="New Password"
                                blurOnSubmit={false}
                            />
                        </View>
                        <View>
                            <Input
                                 value={newPassword.cpassword}
                                 onChangeText={(pass)=>setNewPassword(prev=>({...prev,cpassword:pass}))}
                                secureTextEntry
                                label="New Password Again"
                                blurOnSubmit={false}
                            />
                        </View>
                    </View>
                ) : null}
                <Divider style={{backgroundColor:theme['border-text-color'],marginTop:10}} />
                <View style={{marginTop:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <Button status="danger" disabled={loading} onPress={()=>setDialog(null)}>{i18n.t('cancel')}</Button>
                    
                </View>
            </Lay>
        </Modal>
        <Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} />
        <Password supported={fingerprint} loading={loading} ref={passwordRef} onSubmit={handleSubmit} />
        </>
    )
}