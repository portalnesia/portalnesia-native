import React from 'react';
import {  View,Dimensions,Animated,KeyboardAvoidingView } from 'react-native';
import {Layout as Lay,Text,Card,Input,List,ListItem,Divider,useTheme,Radio,RadioGroup,Toggle} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'
import Modal from 'react-native-modal'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'

import Portalnesia from '@portalnesia/react-native-core'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import {ImageFull} from '@pn/components/global/Image'
import {AdsBanner,AdsBanners,showInterstisial} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import { ucwords,extractMeta,randomInt } from '@portalnesia/utils';
import {saveBase64} from '@pn/utils/Download'
import {useCollapsibleHeader} from 'react-navigation-collapsible'
import {getCollapsOpt} from '@pn/utils/Main'

const headerHeight = 46;
const {width:winWidth,height:winHeight} = Dimensions.get("window")

const tabArray=['url','text','vcard','email','telephone','sms','wifi','geographic'];

const getDefaultValue=(sl)=>{
    let defaultVal;
    if(sl==='url') {
        defaultVal={
            type:'url',
            url:'',
        }
    } else if(sl==='text'){
        defaultVal={
            type:'text',
            text:'',
        }
    } else if(sl==='vcard'){
        defaultVal={
            type:'vcard',
            first_name:'',
            last_name:'',
            telephone:'',
            website:'',
            company:'',
            position:'',
            address:'',
            city:'',
            post_code:'',
            country:''
        }
    } else if(sl==='email'){
        defaultVal={
            type:'email',
            telephone:'',
            subject:'',
            email_content:''
        }
    } else if(sl==='telephone'){
        defaultVal={
            type:'telephone',
            telephone:''
        }
    } else if(sl==='sms'){
        defaultVal={
            type:'sms',
            telephone:'',
            sms_content:''
        }
    } else if(sl==='wifi'){
        defaultVal={
            type:'wifi',
            hidden:false,
            encryption:'nopass',
            ssid:'',
            password:''
        }
    } else if(sl==='geographic'){
        defaultVal={
            type:'geographic',
            latitude:'',
            longitude:''
        }
    }
    return defaultVal;
}

const validCheck=(tipe,input)=>{
    return new Promise((res)=>{
        let error=[];
        if(tipe=='url') {
            if(input?.url?.match(/\S/) == null) error.push("URL required")
        }
        if(tipe=='geographic') {
            if(input?.latitude?.match(/\S/) == null) error.push("Latitude required")
            if(input?.longitude?.match(/\S/) == null) error.push("Longitude required")
        }
        if(tipe=='wifi') {
            if(input?.ssid?.match(/\S/) == null) error.push("SSID required")
        }
        if(tipe=='sms') {
            if(input?.telephone?.match(/\S/) == null) error.push("Telephone number required")
        }
        if(tipe=='telephone') {
            if(input?.telephone?.match(/\S/) == null) error.push("Telephone number required")
        }
        if(tipe=='email') {
            if(input?.email?.match(/\S/) == null) error.push("Email address required")
        }
        if(tipe=='vcard') {
            if(input?.first_name?.match(/\S/) == null) error.push("First name required")
            if(input?.telephone?.match(/\S/) == null) error.push("Telephone number required")
        }
        if(tipe=='text') {
            if(input?.text?.match(/\S/) == null) error.push("Text required")
        }
        return res(error);
    })
}

const QRvcard=React.memo(({onchange,input,disabled})=>{
    const text2=React.useRef(null)
    const text3=React.useRef(null)
    const text4=React.useRef(null)
    const text5=React.useRef(null)
    const text6=React.useRef(null)
    const text7=React.useRef(null)
    const text8=React.useRef(null)
    const text9=React.useRef(null)
    const text10=React.useRef(null)

    return (
        <Lay>
            <Text style={{marginTop:10}}>Your profile data</Text>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="First Name"
                    value={input?.first_name||''}
                    onChangeText={(e)=>onchange('first_name',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text2?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    autoCompleteType="name"
                    placeholder="John"
                    textContentType="name"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text2}
                    label="Last Name"
                    value={input?.last_name||''}
                    onChangeText={(e)=>onchange('last_name',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text3?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    autoCompleteType="name"
                    placeholder="Doe"
                    textContentType="nameSuffix"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text3}
                    label="Telephone Number"
                    value={input?.telephone||''}
                    onChangeText={(e)=>onchange('telephone',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text4?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    autoCompleteType="tel"
                    keyboardType="phone-pad"
                    placeholder="+628987654321"
                    textContentType="telephoneNumber"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text4}
                    label="Website"
                    value={input?.website||''}
                    onChangeText={(e)=>onchange('website',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text5?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    keyboardType="url"
                    placeholder="https://portalnesia.com"
                    textContentType="URL"
                />
            </Lay>
            <Text style={{marginTop:15}}>Company Data</Text>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text5}
                    label="Company"
                    value={input?.company||''}
                    onChangeText={(e)=>onchange('company',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text6?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    placeholder="Company Example"
                    textContentType="organizationName"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text6}
                    label="Position"
                    value={input?.position||''}
                    onChangeText={(e)=>onchange('position',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text7?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    placeholder="CEO"
                />
            </Lay>
            <Text style={{marginTop:15}}>Address Data</Text>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text7}
                    label="Address"
                    value={input?.address||''}
                    onChangeText={(e)=>onchange('address',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text8?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    multiline
                    textAlignVertical="top"
                    placeholder="Jl. Pejanggik"
                    textContentType="fullStreetAddress"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text8}
                    label="City"
                    value={input?.city||''}
                    onChangeText={(e)=>onchange('city',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text9?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    placeholder="Mataram"
                    textContentType="addressCity"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text9}
                    label="Post Code"
                    value={input?.post_code||''}
                    onChangeText={(e)=>onchange('post_code',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text10?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    placeholder="12345"
                    textContentType="postalCode"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text10}
                    label="Country"
                    value={input?.country||''}
                    onChangeText={(e)=>onchange('country',e)}
                    returnKeyType="send"
                    disabled={disabled}
                    placeholder="Indonesia"
                    textContentType="countryName"
                />
            </Lay>
        </Lay>
    )
})

const QRgeo=React.memo(({onchange,input,disabled})=>{
    const text2 = React.useRef(null)
    return(
        <Lay>
            <Lay>
                <Input
                    label="Latitude"
                    value={input?.latitude||''}
                    onChangeText={(e)=>onchange('latitude',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text2?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    enablesReturnKeyAutomatically
                />
            </Lay>
            <Lay>
                <Input
                    ref={text2}
                    value={input?.longitude||''}
                    onChangeText={(e)=>onchange('longitude',e)}
                    label='Longitude'
                    disabled={disabled}
                    enablesReturnKeyAutomatically
                />
            </Lay>
        </Lay>
    )
})
const encMenu=['nopass','WPA','WEP'];
const QRwifi=React.memo(({onchange,input,disabled})=>{
    const incIndex=React.useMemo(()=>{
        const find = encMenu.findIndex(e=>e==input?.encryption);
        return find||0;
    })
    return (
        <Lay>
            <Lay style={{marginVertical:10}}>
                <Toggle
                    checked={input?.hidden||false}
                    disabled={disabled}
                    onChange={e=>onchange('hidden',e)}
                    style={{justifyContent:'flex-start'}}
                >
                    Hidden
                </Toggle>
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Text style={{fontSize:12}} appearance="hint">Encryption</Text>
                <RadioGroup selectedIndex={incIndex} onChange={(index=>onchange('encryption',encMenu[index]))}>
                    <Radio disabled={disabled}>None</Radio>
                    <Radio disabled={disabled}>WPA/WPA2</Radio>
                    <Radio disabled={disabled}>WEP</Radio>
                </RadioGroup>
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="SSID"
                    value={input?.ssid||''}
                    onChangeText={(e)=>onchange('ssid',e)}
                    disabled={disabled}
                    enablesReturnKeyAutomatically
                    placeholder="@wifi...."
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="Password"
                    value={input?.password||''}
                    onChangeText={(e)=>onchange('password',e)}
                    disabled={disabled}
                    secureTextEntry
                />
            </Lay>
        </Lay>
    )
})

const QRsms=React.memo(({onchange,input,disabled})=>{
    const text2 = React.useRef(null)
    return(
        <Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="Telephone"
                    value={input?.telephone||''}
                    onChangeText={(e)=>onchange('telephone',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text2?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    keyboardType="phone-pad"
                    autoCompleteType="tel"
                    enablesReturnKeyAutomatically
                    placeholder="+628987654321"
                    textContentType="telephoneNumber"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text2}
                    value={input?.sms_content||''}
                    onChangeText={(e)=>onchange('sms_content',e)}
                    label='SMS Content'
                    disabled={disabled}
                    textStyle={{minHeight:200,maxHeight:400}}
                    textAlignVertical="top"
                    multiline
                    placeholder="Hello, John Doe"
                />
            </Lay>
        </Lay>
    )
})

const QRtelephone=React.memo(({onchange,input,disabled})=>{
    return(
        <Lay style={{marginVertical:5}}>
            <Input
                label="Telephone"
                value={input?.telephone||''}
                onChangeText={(e)=>onchange('telephone',e)}
                returnKeyType="send"
                disabled={disabled}
                keyboardType="phone-pad"
                autoCompleteType="tel"
                enablesReturnKeyAutomatically
                placeholder="+628987654321"
                textContentType="telephoneNumber"
            />
        </Lay>
    )
})

const QRemail=React.memo(({onchange,input,disabled})=>{
    const text2 = React.useRef(null)
    const text3 = React.useRef(null)
    return(
        <Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="Email"
                    value={input?.email||''}
                    onChangeText={(e)=>onchange('email',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text2?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    keyboardType="email-address"
                    autoCompleteType="email"
                    enablesReturnKeyAutomatically
                    placeholder="example@portalnesia.com"
                    textContentType="emailAddress"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    label="Subject"
                    ref={text2}
                    value={input?.subject||''}
                    onChangeText={(e)=>onchange('subject',e)}
                    returnKeyType="next"
                    onSubmitEditing={()=>text3?.current?.focus()}
                    disabled={disabled}
                    blurOnSubmit={false}
                    placeholder="This is subject of email"
                />
            </Lay>
            <Lay style={{marginVertical:5}}>
                <Input
                    ref={text3}
                    value={input?.email_content||''}
                    onChangeText={(e)=>onchange('email_content',e)}
                    label='Email Content'
                    disabled={disabled}
                    textStyle={{minHeight:200,maxHeight:400}}
                    textAlignVertical="top"
                    multiline
                    placeholder="Hello, John Doe"
                />
            </Lay>
        </Lay>
    )
})

const QRtext=React.memo(({onchange,input,disabled})=>(
    <Lay style={{marginVertical:5}}>
        <Input
            value={input?.text||''}
            onChangeText={(e)=>onchange('text',e)}
            label='Text'
            disabled={disabled}
            textStyle={{minHeight:200,maxHeight:400}}
            textAlignVertical="top"
            multiline
            placeholder="Example text"
        />
    </Lay>
))

const QRurl=React.memo(({onchange,input,disabled})=>(
    <Lay style={{marginVertical:5}}>
        <Input
            value={input?.url||''}
            onChangeText={(e)=>onchange('url',e)}
            label='URL'
            disabled={disabled}
            keyboardType='url'
            returnKeyType="send"
            placeholder="https://portalnesia.com"
            textContentType="URL"
        />
    </Lay>
))

const RenderScene=React.memo(({route,onProcess,scrollProps,headerHeight})=>{
    const context = React.useContext(AuthContext)
    const {setNotif}=context;
    const [input,setInput]=React.useState({});
    const [loading,setLoading]=React.useState(false);
    const {PNpost} = useAPI(false)
    const {showAds} = showInterstisial()

    React.useEffect(()=>{
        const sl=route?.key||'url'
        setInput(getDefaultValue(sl))
    },[route])

    const handleChange=(name,val)=>{
        setInput(prev=>({
            ...prev,
            [name]:val
        }))
    }

    const handleSubmit=()=>{
        setLoading(true);
        validCheck(route.key,input)
        .then((checkError)=>{
            return new Promise((res,rej)=>{
                if(checkError.length > 0) {
                    setNotif(true,"Error",checkError.join("\n"));
                    rej()
                } else {
                    res();
                }
            })
        })
        .then(()=>{
            return Portalnesia.Safetynet.verifyWithRecaptcha()
        })
        .then(recaptcha=>{
            return PNpost(`/qrcode`,{...input,recaptcha})
        })
        .then((res)=>{
            if(!res.error) {
                if(randomInt(2) == 0) showAds();
                const sl=route?.key||'url'
                setInput(getDefaultValue(sl))
                onProcess && onProcess(res.data)
            }
        })
        .finally(()=>{
            setLoading(false)
        })
    }

    return (
        <Animated.ScrollView
            contentContainerStyle={{paddingTop: headerHeight}}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            {...scrollProps}
        >
            <Lay style={{flexGrow:1}}>
                <AdsBanner />
                <Lay style={[style.container,{marginTop:10}]}>
                    <KeyboardAvoidingView>
                    {route?.key == 'url' ? (
                        <QRurl disabled={loading} onchange={handleChange} input={input}  />
                    ) : route?.key == 'text' ? (
                        <QRtext disabled={loading} onchange={handleChange} input={input} />
                    ) : route?.key == 'email' ? (
                        <QRemail disabled={loading} onchange={handleChange} input={input} />
                    ) : route?.key == 'vcard' ? (
                        <QRvcard disabled={loading} onchange={handleChange} input={input} />
                    ) : route?.key == 'telephone' ? (
                        <QRtelephone disabled={loading} onchange={handleChange} input={input}  />
                    ) : route?.key == 'sms' ? (
                        <QRsms disabled={loading} onchange={handleChange} input={input} />
                    ) : route?.key == 'wifi' ? (
                        <QRwifi disabled={loading} onchange={handleChange} input={input} />
                    ) : route?.key == 'geographic' ? (
                        <QRgeo disabled={loading} onchange={handleChange} input={input} />
                    ) : null}
                    </KeyboardAvoidingView>
                </Lay>
                <Divider style={{marginVertical:15}} />
                <Lay style={[style.container]}>
                    <Text category="h6" style={{marginBottom:5}}>Note:</Text>
                    <Text style={{marginBottom:5}}>- Please make sure the QR code works before you download it by scanning it yourself</Text>
                    <Text style={{marginBottom:5}}>- Information you provide will not be stored on our server.</Text>
                </Lay>
            </Lay>
            <AdsBanners size="MEDIUM_RECTANGLE" />
            <Lay style={{padding:15}}>
                <Button onPress={handleSubmit} disabled={loading} loading={loading}>Send</Button>
            </Lay>
        </Animated.ScrollView>
    )
})

export default function QrCodeGenerator({navigation,route}){
    const context = React.useContext(AuthContext)
    const {setNotif}=context;
    const slug = route?.params?.slug
	const [tabIndex,setTabIndex] = React.useState(()=>{
        const find = tabArray.findIndex(e=>e===slug)
        return find === -1 ? 0 : find;
    });
	const [routes]=React.useState([
        {key:'url',title:"URL"},
        {key:'text',title:"Text"},
        {key:'email',title:"Email"},
        {key:'vcard',title:"Vcard"},
        {key:"telephone",title:"Telephone"},
        {key:"sms",title:"SMS"},
        {key:'wifi',title:"Wifi"},
        {key:'geographic',title:'Geographic'}
    ])
	const theme = useTheme()
    const [openMenu,setOpenMenu]=React.useState(false)
    const [open,setOpen] = React.useState(null)
    const [loading,setLoading]=React.useState(null)

    const {onScroll,containerPaddingTop,scrollIndicatorInsetTop,translateY} = useCollapsibleHeader(getCollapsOpt(theme,false))

    const renderTabBar=(props)=>{
        return (
			<Animated.View style={{zIndex: 1,position:'absolute',backgroundColor: theme['background-basic-color-1'],elevation:5,height:headerHeight,top:containerPaddingTop,width: '100%',transform: [{translateY}]}}>
                <TabBar
                    {...props}
                    style={{height:headerHeight,backgroundColor:theme['background-basic-color-1']}}
                    indicatorStyle={{backgroundColor:theme['color-indicator-bar'],height:3}}
                    renderLabel={({route,focused})=>{
                        return <Text appearance={focused ? 'default' : 'hint'}>{route.title||""}</Text>
                    }}
                    pressColor={theme['color-control-transparent-disabled']}
                    pressOpacity={0.8}
                    scrollEnabled
                />
			</Animated.View>
		)
    }

    const renderScene=({route})=>{
        return <RenderScene route={route} onProcess={onProcess} scrollProps={{onScroll,contentContainerStyle:{paddingTop: containerPaddingTop+headerHeight},scrollIndicatorInset:{top:scrollIndicatorInsetTop+headerHeight}}} headerHeight={headerHeight} />;
    }

    const renderTabView=()=>{
        return (
            <TabView
                onIndexChange={(index)=>setTabIndex(index)}
                navigationState={{index:tabIndex,routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                initialLayout={{height:0,width:winHeight}}
                lazy
            />
        )
    }

    const onProcess=(dt)=>{
        setOpen(dt)
    }

    const handleDownload=()=>{
        setLoading(true);
        let image_data = open?.src?.split("data:image/png;base64,");
        image_data = image_data[1];
        saveBase64(image_data,`QR_${open?.id?.substring(1)}.png`)
        .then(()=>{
            setNotif(false,"Saved");
            setOpen(null)
        })
        .catch(err=>{
            setNotif(true,"Error",err?.message||"Something went wrong");
        })
        .finally(()=>setLoading(false))
    }

    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{setOpenMenu(true)}} />,[]);

    return (
        <>
            <Layout title="QR Code Generator" subtitle="Tools" navigation={navigation} menu={menuToggle} whiteBg>
                {renderTabView()}
            </Layout>
            <MenuContainer
                visible={openMenu}
                handleOpen={()=>setOpenMenu(true)}
                handleClose={()=>setOpenMenu(false)}
                onClose={()=>setOpenMenu(false)}
                type="tools"
                item_id="qr_code_generator"
                share={{
                    link:`/qr-code?utm_campaign=tools`,
                    title:`QR Code Generator - Portalnesia`
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
            <Modal
                isVisible={open !== null}
                style={{margin:0,justifyContent:'center'}}
                onBackdropPress={()=>setOpen(null)}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <Lay style={{maxWidth:winWidth-20,margin:10,paddingVertical:20,paddingHorizontal:10,borderRadius:10}}>
                    {open!==null ? (
                        <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{marginBottom:15}}>{open?.id}</Text>
                            <ImageFull contentWidth={winWidth-40} source={{uri:open.src}} />
                            <Lay style={{marginTop:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                <Button onPress={handleDownload} disabled={loading} style={{marginRight:15}}>Download</Button>
                                <Button status="danger" onPress={()=>setOpen(null)}>Close</Button>
                            </Lay>
                        </View>
                    ) : null}
                </Lay>
            </Modal>
        </>
    )
}