import React from 'react'
import {ScrollView,RefreshControl,View,Dimensions,TextInput,FlatList} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Icon,CheckBox,ListItem} from '@ui-kitten/components'
//import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import Image from '@pn/module/FastImage'
import Modal from 'react-native-modal'
import {Constants} from 'react-native-unimodules'
import * as Device from 'expo-device'
import * as Cellular from 'expo-cellular'
import moment from 'moment'
import RNFS from 'react-native-fs'

import Pressable from '@pn/components/global/Pressable'
import Layout from '@pn/components/global/Layout';
import usePost from '@pn/utils/API'
import TopAction from '@pn/components/navigation/TopAction'
import { jsStyles, ucwords } from '@pn/utils/Main'
import Localization from '@pn/module/Localization'
import { AuthContext } from '@pn/provider/Context'
import Backdrop from '@pn/components/global/Backdrop';
import verifyRecaptcha from '@pn/module/Recaptcha'

const SendIcon = (props)=><Icon {...props} name="send" pack="material" />
const {width,height} = Dimensions.get('window')

/*
    type: 'report'|'feedback'
    force
    urlreported,
    endpoint?:null
*/

export default function ReportScreen({navigation,route}){
    const {title,uri,force,endpoint,type,urlreported,contentTitle,contentId,contentType} = route?.params
    const context = React.useContext(AuthContext)
    const {setNotif,state:{user}}=context;
    const [input,setInput]=React.useState("");
    const [loading,setLoading]=React.useState(false);
    const [check,setCheck]=React.useState(true);
    const theme = useTheme()
    const [modal,setModal]=React.useState(false)
    const {PNpost} = usePost()

    const ContentType = React.useMemo(()=>{
        if(type==='konten') return "Content Report";
        if(type==='komentar') return 'Comment Report';
        if(type==='url') return 'URL Report'
        return 'Feedback';
    },[type])

    const SystemInfo=React.useMemo(()=>{
        let info=[
            {key:"Report type",value:ContentType},
            ...(contentType ? [{key:"Content type",value:ucwords(contentType)}] : []),
            ...(contentId ? [{key:type==='konten' ? "Content ID" : "Comment ID",value:contentId}] : []),
            ...(contentTitle ? [{key:"Content title",value:contentTitle}] : []),
            {key:"Package version",value:Constants.nativeBuildVersion},
            {key:"Package version name",value:`v${Constants.nativeAppVersion}`},
            {key:"Javascript bundle version",value:`v${Constants.manifest.version}`},
            {key:"Locale",value:Localization.getLocales()[0].languageTag},
            {key:"Time",value:moment().format("dddd, Do MMMM YYYY, hh:mm")},
            {key:"Device",value:Device.designName},
            {key:"Build ID",value:Device.osBuildId},
            {key:"Build fingerprint",value:Device.osBuildFingerprint},
            {key:"Model",value:Device.modelName},
            {key:"Product",value:Device.productName},
            {key:"SDK version",value:Device.platformApiLevel},
            {key:"Brand",value:Device.brand},
            ...(Cellular.carrier !== null ? [{key:"Network provider",value:Cellular.carrier}] : []),
            ...(Cellular.mobileCountryCode !== null ? [{key:"Network MCC code",value:Cellular.mobileCountryCode}] : []),
            ...(Cellular.mobileNetworkCode !== null ? [{key:"Network MNC code",value:Cellular.mobileNetworkCode}] : []),
        ];
        if(user !== false) {
            const dtUser=[
                {key:"Username",value:user.username},
                {key:"Name",value:user.name},
                {key:"Email",value:user.email}
            ]
            info = dtUser.concat(info);
        }
        return info;
    },[title])

    const handleSend=async()=>{
        if((force===undefined || force===true) && input?.match(/\S/)===null) {
            setNotif(true,"Error","Description is required")
        } else {
            setLoading(true);
            const sysInfo = SystemInfo.reduce((accu,array)=>{
                const val = jsStyles(array.key);
                accu[val]=array.value;
                return accu;
            },{})
            const recaptcha = await verifyRecaptcha(setNotif);
            const data={
                type,
                text:input,
                recaptcha,
                ...(endpoint ? {endpoint} : {}),
                urlreported,
                sysInfo:JSON.stringify(sysInfo),
            }
            try {
                if(check) {
                    const image = await RNFS.readFile(uri,'base64')
                    data.image = image;
                }
                const res = await PNpost(`/backend/report`,data);
                if(!res.error) {
                    navigation?.goBack();
                    setNotif(false,"Success",res?.msg||"Success");
                }
            } 
            finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
            <Layout navigation={navigation} withBack title={title} whiteBg menu={()=><TopAction icon={SendIcon} tooltip={i18n.t('send')} onPress={handleSend} />}>
                <Lay style={{paddingHorizontal:15,paddingVertical:10,paddingTop:20,flexGrow:1,flexShrink:1}}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder={type==='url' ? i18n.t('report_placeholder.placeholder_url') : (type === 'feedback' ? i18n.t('report_placeholder.placeholder') : i18n.t('report_placeholder.placeholder_content',{type:(type === 'konten' ? i18n.t('content',{count:1}) : i18n.t('comment',{count:1}))}))}
                        multiline
                        placeholderTextColor={theme['text-hint-color']}
                        style={{color:theme['text-basic-color'],padding:0,fontSize:15,margin:0,flex:1}}
                        textAlignVertical="top"
                    />
                </Lay>
                <Lay style={{paddingBottom:10}}>
                    <Pressable style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:15,marginVertical:10,borderColor:theme['border-text-color'],borderRadius:5,borderWidth:2}} onPress={()=>navigation?.navigate("ReportModal",{uri,title,force,endpoint,type,urlreported,contentTitle,contentId,contentType})}>
                        <View style={{flexDirection:'row',alignItems:'center',marginVertical:15,marginLeft:10}}>
                            <View style={{marginLeft:5,marginRight:15}}>
                                <CheckBox checked={check} onChange={setCheck} />
                            </View>
                            <View>
                                <Text style={{fontFamily:"Inter_SemiBold"}}>Screenshot</Text>
                                <Text appearance="hint" style={{fontSize:13}}>Highlight or hide info</Text>
                            </View>
                        </View>
                        <View style={{marginVertical:1,marginRight:1}}>
                            <Image
                                source={{uri}}
                                style={{width:75,height:75}}
                            />
                        </View>
                    </Pressable>
                </Lay>
                <Lay style={{paddingHorizontal:15,paddingBottom:20}}>
                    <Text>
                        <Text style={{fontSize:13}}>Some </Text>
                        <Text style={{fontSize:13}} status="info" onPress={()=>setModal(true)}>system information </Text>
                        <Text style={{fontSize:13}}>may be sent to Portalnesia. We will use the information that give us to help address technical issues and to improve our services.</Text>
                    </Text>
                </Lay>
            </Layout>
            <Modal
                isVisible={modal}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
				<RenderModal onClose={()=>setModal(false)} theme={theme} systemInfo={SystemInfo} />
			</Modal>
            <Backdrop loading visible={loading} />
        </>
    )
}

const RenderModal=React.memo(({onClose,theme,systemInfo})=>{
    return (
        <Lay style={{padding:10,width:width-20,borderRadius:10}}>
			<View style={{marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
				<Text>System Information</Text>
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
                    renderItem={(props)=> <RenderList {...props}/> }
                />
            </View>
        </Lay>
    )
})

const RenderList=React.memo(({item,index:i})=>{
    return (
        <ListItem key={i} title={item?.key} description={item?.value} disabled />
    )
})