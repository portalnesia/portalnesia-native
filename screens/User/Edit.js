import React from 'react'
import {ScrollView,View,Dimensions, Alert,RefreshControl} from 'react-native'
import {Layout as Lay, Text,Input,Select,SelectItem,IndexPath,Datepicker, useTheme,Spinner,Divider, Icon} from '@ui-kitten/components'
import i18n from 'i18n-js'
import moment from 'moment'
import {MomentDateService} from '@ui-kitten/moment'
import {MediaTypeOptions} from 'expo-image-picker'

import Layout from "@pn/components/global/Layout";
import Button from "@pn/components/global/Button";
import Pressable from "@pn/components/global/Pressable";
import { AuthContext } from '@pn/provider/Context';
import NotFound from '@pn/components/global/NotFound'
import NotFoundScreen from '../NotFound'
import MarkdownEditor from '@pn/components/markdown/Editor'
import Image from '@pn/components/global/Image'
import { extractMeta, ucwords } from '@portalnesia/utils';
import useSWR from '@pn/utils/swr'
import { FeedbackToggle, MenuContainer } from '@pn/components/global/MoreMenu'
import Backdrop from '@pn/components/global/Backdrop'
import Avatar from '@pn/components/global/Avatar'
import { pickImage } from '@pn/utils/PickLibrary';
import Recaptcha from '@pn/components/global/Recaptcha'
import useAPI from '@pn/utils/API'
import useUnsaved from '@pn/utils/useUnsaved'
import useSelector from '@pn/provider/actions'
import { Portal } from '@gorhom/portal'

const {width}=Dimensions.get('window')
const dateService = new MomentDateService();

const getGenderArr=()=>([i18n.t('gender.male'),i18n.t('gender.female')]);
export default function EditUserScreen({navigation,route}){
    const username = route.params?.username;
    const {user,lang} = useSelector(state=>({user:state.user,lang:state.lang}))
    if(!user || !username || user?.username != username) return <NotFoundScreen navigation={navigation} route={route} />

    const context = React.useContext(AuthContext);
    const {setNotif} = context;
    const {PNpost,cancelPost} = useAPI();
    const theme = useTheme();
    const {data,error,mutate,isValidating}=useSWR(`/user/${user?.username}/edit`,{},true)
    const [name,setName]=React.useState("");
    const [about,setAbout]=React.useState("");
    const [gender,setGender]=React.useState(new IndexPath(0));
    const [date,setDate]=React.useState(moment().subtract(17,"years"));
    const [photoMenu,setPhotoMenu]=React.useState(false);
    const markdownRef = React.useRef(null)
    const [backdrop,setBackdrop] = React.useState(null);
    const [loading,setLoading]=React.useState(false);
    const [progressUpload,setProgressUpload]=React.useState(0);
    const [image,setImage]=React.useState(null);
    const captchaRef = React.useRef(null)
    const [validate,setValidate]=React.useState(false);
    const [initialImage,setInitialImage]=React.useState(null);
    const setCanBack = useUnsaved(true);

    const genderArr=React.useMemo(()=>{
        return getGenderArr();
    },[lang])

    React.useEffect(()=>{
        if(data){
            if(data?.users?.birthday) setDate(moment(data?.users?.birthday));
            if(data?.users?.name) setName(data?.users?.name)
            if(data?.users?.biodata) setAbout(data?.users?.biodata)
            if(data?.users?.gender) setGender(new IndexPath(data?.users?.gender))
            if(data?.users?.image) {
                setImage(data?.users?.image)
                setInitialImage(data?.users?.image)
            }
        }
    },[data])

    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    const handleChange=(type)=>(val)=>{
        if(type==='date') {
            if(val === data?.users?.birthday) setCanBack(true)
            else setCanBack(false)
            setDate(val);
        }
        else if(type==='name') {
            if(val === data?.users?.name) setCanBack(true)
            else setCanBack(false)
            setName(val);
        }
        else if(type==='about') {
            if(val === data?.users?.biodata) setCanBack(true)
            else setCanBack(false)
            setAbout(val);
        }
        else if(type==='gender') {
            if(val === data?.users?.gender) setCanBack(true)
            else setCanBack(false)
            setGender(val);
        }
    }

    const handleRemoveImage=()=>{
        if(!data) return;
        setBackdrop('loading')
        captchaRef.current.getToken()
        .then(recaptcha=>{
            return PNpost(`/user/${data?.users?.username}/edit`,{remove_image:true,recaptcha})
        })
        .then((res)=>{
            if(!Boolean(res?.error)) {
                setImage(null);
                setNotif(false,res?.msg)
            }
        })
        .catch(()=>{
            setImage(initialImage)
        })
        .finally(()=>{
            setBackdrop(null);
        })
    }

    const alertRemoveImage=()=>{
        Alert.alert(
            i18n.t('errors.sure'),
            undefined,
            [{
                text:i18n.t('cancel'),
                onPress:()=>{}
            },{
                text:i18n.t('remove'),
                onPress:handleRemoveImage
            }]
        )
    }

    const handleChangeImage=()=>{
        if(!data) return;
        pickImage({mediaTypes:MediaTypeOptions.Images,allowsEditing:true,aspect:[500,500]})
        .then((result)=>{
            if(!result.exists) return setNotif(true,"Error",i18n.t('errors.no_image'));
            if(result?.size > 5242880) return setNotif(true,"Error",i18n.t('errors.size_image'));
            setImage(result.uri);
            uploadImage(result.uri)
        })
        .catch(err=>{
            if(err?.type === 0) return;
            if(err?.message) setNotif(true,"Error",err.message);
        })
    }

    const uploadImage=async(image)=>{
        setProgressUpload(0)
        setBackdrop('progress');
        const opt={
            headers:{
                'Content-Type':'multipart/form-data'
            },
            onUploadProgress:function(progEvent){
                const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                setProgressUpload(complete);
            }
        }
        const form = new FormData();
        const {name,match} = extractMeta(image);
        form.append('image',{uri:image,name,type:`image/${match[1]}`});
        form.append('image_name',name);
        const recaptcha = await captchaRef.current.getToken();
        form.append('recaptcha',recaptcha);
        try {
            const res = await PNpost(`/user/${data?.users?.username}/edit`,form,opt)
            if(!Boolean(res?.error)) setNotif(false,res?.msg);
        } catch(e) {
            setImage(initialImage)
        } finally {
            setProgressUpload(0)
            setBackdrop(null);
        }
    }

    const cancelRequest=React.useCallback(()=>{
        cancelPost();
        setImage(initialImage)
        setProgressUpload(0)
        setBackdrop(null);
    },[cancelPost,initialImage])

    const handleSubmit=()=>{
        if(!data) return;
        if(name?.match(/\S+/) === null) return setNotif(true,"Error",i18n.t('errors.form_validation',{type:i18n.t('form.name')}))
        setLoading(true)
        const birthday = moment(date).format("YYYY-MM-DD");
        const input={
            about,
            gender:gender.row,
            name,
            birthday
        }
        captchaRef.current.getToken()
        .then(recaptcha=>{
            return PNpost(`/user/${data?.users?.username}/edit`,{...input,recaptcha})
        })
        .then((res)=>{
            if(!Boolean(res?.error)) {
                mutate({data:{users:{...data?.users,name,biodata:about,birthday:date,gender:gender.row}}})
                setNotif(false,res?.msg);
            }
        })
        .finally(()=>{
            setLoading(false)
        })
    }

    return (
        <>
        <Layout navigation={navigation} title={`Edit ${ucwords(i18n.t('profile'))}`} {...(data?.users?.username ? {menu:()=><FeedbackToggle link={`/user/${data?.users?.username}/edit`} />} : {})}>
            {!data && !error ? (
                <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Spinner size="large" />
                </Lay>
            ) : error || data?.error ? (
                <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
            ) : (
                <ScrollView contentContainerStyle={{flexGrow:1}} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
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
                >
                    <Lay style={{paddingHorizontal:15}}>
                        {typeof data?.users?.image !== 'undefined' && (
                            <Lay style={{paddingVertical:25}}>
                                <Lay style={{flexDirection:'row',justifyContent:'center',position:'relative'}}>
                                    {image !== null ? (
                                        <Image {...(image.match(/^file\:\/\//) !== null ? {source:{uri:image}} : {source:{uri:`${image}&size=130&watermark=no`},dataSrc:{uri:`${image}&watermark=no`}})} style={{height:130,width:130,borderRadius:70}} fancybox />
                                    ) : (
                                        <Avatar name={ucwords(data?.users?.name)} size={130} />
                                    )}
                                    <View style={{backgroundColor:theme['color-primary-500'],height:50,width:50,borderRadius:30,position:'absolute',top:80,left:(width/2),flexDirection:'row',justifyContent:'center',alignItems:'center',overflow:'hidden'}}>
                                        <Pressable tooltip={`Edit ${i18n.t('profile_type',{type:i18n.t('picture',{count:1})})}`} disabled={backdrop!==null||loading} style={{padding:13}} onPress={()=>setPhotoMenu(true)}>
                                            <Icon name="edit" style={{width:24,height:24,tintColor:'#fff'}} />
                                        </Pressable>
                                    </View>
                                </Lay>
                            </Lay>
                        )}
                        <Lay style={{paddingTop:10}}>
                            <Input
                                label={i18n.t('form.name')}
                                value={name}
                                onChangeText={handleChange('name')}
                                autoCompleteType="name"
                                textContentType="name"
                                disabled={backdrop!==null||loading}
                            />
                        </Lay>
                        <Lay style={{paddingTop:10}}>
                            <Select
                                selectedIndex={gender}
                                onSelect={handleChange('gender')}
                                label={i18n.t('form.gender')}
                                value={genderArr[gender.row]}
                                disabled={backdrop!==null||loading}
                            >
                                {genderArr.map((dt,i)=>(
                                    <SelectItem key={i.toString()} title={dt} />
                                ))}
                            </Select>
                        </Lay>
                        <Lay style={{paddingTop:10}}>
                            <Datepicker
                                dateService={dateService}
                                placeholder="Pick date"
                                date={date}
                                onSelect={handleChange('date')}
                                label={i18n.t('form.birthday')}
                                max={moment().subtract(13,"years")}
                                min={moment().subtract(60,"years")}
                                disabled={backdrop!==null||loading}
                            />
                        </Lay>
                    </Lay>
                    <Lay style={{paddingTop:10}}>
                        <MarkdownEditor disabled={backdrop!==null||loading} ref={markdownRef} value={about} label={i18n.t('form.about')} theme={theme} onChangeText={handleChange('about')} />
                    </Lay>
                    <Lay style={{padding:15}}>
                        <Button onPress={handleSubmit} disabled={backdrop!==null||loading} loading={loading}>{ucwords(i18n.t("save"))}</Button>
                    </Lay>
                </ScrollView>
            )}
        </Layout>
        <MenuContainer
            visible={photoMenu}
            onClose={()=>setPhotoMenu(false)}
            menu={[{
                title:i18n.t('change_type',{type:i18n.t('profile_type',{type:i18n.t('picture',{count:1})})}),
                onPress:handleChangeImage,
                icon:"image"
            },{
                title:i18n.t('remove_type',{type:i18n.t('profile_type',{type:i18n.t('picture',{count:1})})}),
                onPress:alertRemoveImage,
                icon:"trash",
                color:theme['color-danger-500']
            }]}
        />
        <Recaptcha ref={captchaRef} />
        <Portal>
            <Backdrop
                visible={backdrop!==null}
                {...(backdrop=='progress' ? {progress:progressUpload,text:(progressUpload<100 ? "Uploading..." : "Processing...")} : {loading:true})}
                onCancel={cancelRequest}
            />
        </Portal>
        </>
    )
}