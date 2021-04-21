import React from 'react'
import {Animated,Image,View,LogBox,Alert} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider, MenuGroup,MenuItem,Menu, Icon} from '@ui-kitten/components'
import * as Linking from 'expo-linking'
import {openBrowserAsync} from 'expo-web-browser'
import {useLinkTo} from '@react-navigation/native'
import compareVersion from 'compare-versions'

import Button from '@pn/components/global/Button'
import Backdrop from '@pn/components/global/Backdrop';
import Layout from '@pn/components/global/Layout'
import Avatar from '@pn/components/global/Avatar'
import {AuthContext} from '@pn/provider/AuthProvider'
import {menu as getMenu} from '../constants/menu'
import Header,{useHeader,headerHeight,TopAction} from '@pn/components/navigation/Header'
import {Constants} from 'react-native-unimodules'
import useAPI from '@pn/utils/API'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import useLogin from '@pn/utils/Login'
import Portalnesia from '@pn/module/Portalnesia'
import downloadFile from '@pn/utils/Download'
import {startActivityAsync,ACTION_APP_NOTIFICATION_SETTINGS} from 'expo-intent-launcher'

LogBox.ignoreLogs(['VirtualizedLists should']);

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />
const SettingIcon=(props)=><Icon {...props} name="settings-outline" />
const supportedAbi = ['arm64-v8a','armeabi-v7a','x86','x86_64']

export default function({navigation}){
    const auth = React.useContext(AuthContext)
    const {setNotif} = auth;
    const user = auth.state.user
    const {PNget} = useAPI(false)
    const theme = useTheme()
    const heightt = {...headerHeight,sub:100}
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub + 20
    const [loading,setLoading] = React.useState(false)
    const menu = getMenu(i18n)
    const linkTo = useLinkTo();
    const {login} = useLogin();

    const handleUpdate=React.useCallback(async(url,version)=>{
        const myAbi = Portalnesia.SUPPORTED_ABIS;
        let getAbi=null;
        let i=0;

        while (getAbi===null && i < myAbi.length) {
            if(supportedAbi.indexOf(myAbi[i]) !== -1) {
                getAbi = supportedAbi[i];
            } else i++;
        }
        
        const download_url = getAbi === null ? `${url}/Portalnesia-universal-v${version}.apk` : `${url}/Portalnesia-${getAbi}-v${version}.apk`;
        
        try {
            const download = await downloadFile(download_url,"Portalnesia.apk","pn://login-callback",false,"pn://second-screen?type=update_app");
        
            if(download) {
                setNotif(false,"Download","Start downloading...");
                download.start();
            }
        } catch(err) {
            setNotif(true,"Error",err?.message||"Something went wrong");
        }

    },[])

    const handleLogin = React.useCallback(async()=>{
        const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"2.0.0",">=");
        if(isUpdated) {
            if(user !== false) {
                return linkTo(`/user/${user?.username}`)
            } else {
                setLoading(true)
                await login();
                setLoading(false);
            }
        } else {
            setNotif(true,"Under Maintenance","This feature is under maintenance");
        }
    },[user])

    const checkUpdates=React.useCallback(()=>{
        setLoading(true)
        PNget('/check_update')
        .then((res)=>{
            if(!res.error) {
                const isUpdated = compareVersion.compare(Constants.nativeAppVersion,res?.data?.version,"<");
                if(isUpdated) {
                    const url = res?.data?.url || false;
                    let btn=[
                        {
                            text:"Later",
                            onPress:()=>{}
                        }
                    ];
                    if(url) {
                        btn = btn.concat({
                            text:"UPDATE",
                            onPress:()=>handleUpdate(url,res?.data?.version)
                        })
                    }
                    Alert.alert(
                        "New Version Available",
                        `v${res?.data?.version}`,
                        btn
                    )
                } else {
                    Alert.alert(
                        "Your version is up to date",
                        `v${res?.data?.version}`,
                        [
                            {
                                text:"OK",
                                onPress:()=>{}
                            }
                        ]
                    )
                }
            }
        })
        .finally(()=>setLoading(false))
    },[])

    return (
        <>
        <Layout navigation={navigation} >
            <Animated.View style={{position:'absolute',backgroundColor: theme['color-basic-100'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title="Portalnesia" navigation={navigation} height={56} menu={()=><TopAction tooltip={i18n.t('setting')} icon={SettingIcon} onPress={()=>navigation.navigate("Setting")} />}>
                    <Lay level="1" style={{height:100,paddingVertical:10,paddingHorizontal:15,alignItems:'center',flexDirection:'row'}}>
                        <Lay level="1" style={{marginRight:20}}><Avatar size={60} {...(user !== false ? {src:`${user?.picture}&watermark=no`} : {avatar:true})} /></Lay>
                        <Lay level="1" style={{marginRight:20}}>
                            <Text style={{fontWeight:'700'}}>{user!==false ? user?.name : "portalnesia.com"}</Text>
                            <Text style={{fontSize:12}}>{user !==false ? `@${user?.username}` : `© ${new Date().getFullYear()}`}</Text>
                        </Lay>
                        <Lay level="1" style={{flex:1}}>
                            <View style={{alignItems:'flex-end'}}><Button onPress={handleLogin}>{user === false ? "Login" : "Profile"}</Button></View>
                        </Lay>
                    </Lay>
				</Header>
			</Animated.View>
            <Animated.ScrollView
				contentContainerStyle={{
					flexGrow: 1,
                    paddingTop:heightHeader
				}}
                {...other}
			>
                {menu.map((dt,i)=>(
                    <React.Fragment key={i}>
                        <Text appearance="hint" style={{paddingLeft:15,paddingRight:15,marginBottom:5,fontSize:13}}>{dt.title}</Text>
                        <Lay level="2" style={{marginBottom:20}}>
                            {_renderMenu(dt.menu,i,navigation,theme,checkUpdates)}
                        </Lay>
                    </React.Fragment>
                ))}
                <View style={{paddingLeft:15,paddingRight:15,paddingBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <Text style={{fontSize:12}} appearance="hint">{`v${Constants.nativeAppVersion}`}</Text>
                    <Text style={{fontSize:12}} appearance="hint">{`Portalnesia © ${new Date().getFullYear()}`}</Text>
                </View>
            </Animated.ScrollView>
        </Layout>
        <Backdrop loading visible={loading} />
        </>
    )
}

const _renderMenu=(dt,i,navigation,theme,checkUpdates)=>{
    return (
        <Menu>
            {dt.map((it,ii)=>{
                if(it.menu) {
                    const Title = ()=>{
                        if(it.icon) {
                            return (
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <View style={{marginRight:10}}><Icon name={it.icon[0]} {...(it?.icon?.[1] ? {pack:it.icon[1]} : {})} style={{height:15,tintColor:theme['text-basic-color']}} /></View>
                                    <Text>{it.title}</Text>
                                </View>
                            )
                        } else return <Text>{it.title}</Text>
                    }
                    return (
                        <MenuGroup key={`${i}-${ii}`} title={Title} style={{paddingHorizontal:15,paddingVertical:14}}>
                            {it.menu.map((itt,iii)=>(
                                <MenuItem key={`${i}-${ii}-${iii}`} title={()=><Text style={{marginLeft:15}}>{itt.title}</Text>} onPress={()=>itt.to ? navigation.navigate(itt.to,itt?.params||{}) : itt.link ? Linking.openURL(itt.link) : undefined} />
                            ))}
                        </MenuGroup>
                    )
                } else {
                    const Title = ()=>{
                        if(it.icon) {
                            return (
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <View style={{marginRight:10}}><Icon name={it.icon[0]} {...(it?.icon?.[1] ? {pack:it.icon[1],style:{height:15,tintColor:theme['text-basic-color']}} : {height:'15',width:'15',fill:theme['text-basic-color']})} /></View>
                                    <Text>{it.title}</Text>
                                </View>
                            )
                        } else return <Text>{it.title}</Text>
                    }
                    const onPress=()=>{
                        if(it?.to === "CheckUpdate") checkUpdates();
                        else if(it.to) navigation.navigate(it.to,it?.params||{})
                        else if(it.link) {
                            if(!it.link?.match(/https?\:\/\/+/)) {
                                Linking.openURL(it.link)
                            } else {
                                openBrowserAsync(it.link,{
                                    enableDefaultShare:true,
                                    toolbarColor:'#2f6f4e',
                                    showTitle:true
                                })
                            }
                        }
                    }
                    return (
                        <MenuItem style={{paddingHorizontal:15,paddingVertical:14}} key={`${i}-${ii}`} title={Title}  accessoryRight={ForwardIcon} onPress={onPress} />
                    )
                }
            })}
        </Menu>
    )
}