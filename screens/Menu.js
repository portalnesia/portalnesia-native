import React from 'react'
import {Animated,Image,View,LogBox,Alert} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider, MenuGroup,MenuItem,Menu, Icon} from '@ui-kitten/components'
import * as Linking from 'expo-linking'
import {linkTo} from '@pn/navigation/useRootNavigation'
import compareVersion from 'compare-versions'
import {useScrollToTop} from '@react-navigation/native'
import {DATAS_URL} from '@env'
import Button from '@pn/components/global/Button'
import Backdrop from '@pn/components/global/Backdrop';
import Layout from '@pn/components/global/Layout'
import Avatar from '@pn/components/global/Avatar'
import {AuthContext} from '@pn/provider/Context'
import {menu as getMenu} from '../constants/menu'
import TopAction from '@pn/components/navigation/TopAction'
import {Constants} from 'react-native-unimodules'
import useAPI from '@pn/utils/API'
import i18n from 'i18n-js'
import Portalnesia from '@portalnesia/react-native-core'
import downloadFile from '@pn/utils/Download'
import { openBrowser,getCollapsOpt } from '@pn/utils/Main'
import Authentication from '@pn/module/Authentication'
import useSelector from '@pn/provider/actions'
import {useCollapsibleHeader} from 'react-navigation-collapsible'
LogBox.ignoreLogs(['VirtualizedLists should']);

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />
const SettingIcon=(props)=><Icon {...props} name="settings-outline" />
const supportedAbi = ['arm64-v8a','armeabi-v7a','x86','x86_64']

export default function({navigation,route}){
    const linkAction = route?.params?.action;
    const auth = React.useContext(AuthContext)
    const user = useSelector(state=>state.user);
    const {setNotif,sendReport} = auth;
    const {PNget,cancelGet} = useAPI(false)
    const theme = useTheme()

    const {translateY,onScroll,containerPaddingTop,scrollIndicatorInsetTop} = useCollapsibleHeader(getCollapsOpt(theme,false))
    const [loading,setLoading] = React.useState(false)
    const menu = React.useMemo(()=>getMenu(i18n,user),[user])
    const ref=React.useRef(null);
    useScrollToTop(ref)

    const handleUpdate=React.useCallback(async(url,version)=>{
        const myAbi = Portalnesia.Core.SUPPORTED_ABIS;
        let getAbi=null;
        let i=0;

        while (getAbi===null && i < myAbi.length) {
            if(supportedAbi.indexOf(myAbi[i]) !== -1) {
                getAbi = supportedAbi[i];
            } else i++;
        }
        
        const download_url = getAbi === null ? `${url}/Portalnesia-universal-v${version}.apk` : `${url}/Portalnesia-${getAbi}-v${version}.apk`;
        
        try {
            const filename = getAbi === null ? `Portalnesia-universal-v${version}.apk` : `Portalnesia-${getAbi}-v${version}.apk`;
            const download = downloadFile(download_url,filename,"application/vnd.android.package-archive",Portalnesia.Files.DIRECTORY_DOWNLOADS);
            
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
                Authentication.startAuthActivity();
            }
        } else {
            setNotif(true,"Under Maintenance","This feature is under maintenance");
        }
    },[user,navigation])

    const checkUpdates=React.useCallback(()=>{
        setLoading(true)
        PNget('/check_update')
        .then((res)=>{
            if(!res.error) {
                const isUpdated = compareVersion.compare(Constants.nativeAppVersion,res?.data?.version,"<");
                const url = res?.data?.url || false;
                if(isUpdated) {
                    let btn=[
                        {
                            text:"Changelog",
                            onPress:()=>openBrowser(`${DATAS_URL}/native/v${res?.data?.bundle}`,false)
                        },
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
                        `${res?.data?.version == res?.data?.bundle ? `v${res?.data?.version}` : `Native version ${res?.data?.version}\nBundle version ${res?.data?.bundle}`}`,
                        [
                            {
                                text:"Download APK",
                                onPress:()=>handleUpdate(url,res?.data?.version)
                            },{
                                text:"Changelog",
                                onPress:()=>openBrowser(`${DATAS_URL}/native/v${res?.data?.bundle}`,false)
                            },
                            {
                                text:"OK",
                                onPress:()=>{}
                            }
                        ]
                    )
                }
            }
        })
        .finally(()=>{
            setLoading(false)
            navigation?.navigate("Menu",{action:undefined});
        })
    },[PNget])

    const cancelCheckUpdates=React.useCallback(()=>{
        cancelGet();
        setLoading(false);
    },[cancelGet])

    React.useEffect(()=>{
        if(linkAction === 'check_updates') {
            checkUpdates();
        }
    },[linkAction,checkUpdates,navigation])

    const RenderMenu=React.useMemo(()=>{
        return menu.map((dt,i)=>(
            <React.Fragment key={i}>
                <Text appearance="hint" style={{paddingLeft:15,paddingRight:15,marginBottom:5,fontSize:13}}>{dt.title}</Text>
                <Lay level="2" style={{marginBottom:20}}>
                    {_renderMenu(dt.menu,i,navigation,theme,checkUpdates,sendReport)}
                </Lay>
            </React.Fragment>
        ))
    },[menu,navigation,theme,checkUpdates,sendReport])

    const menuToggle=React.useCallback(()=><TopAction tooltip={i18n.t('setting')} icon={SettingIcon} onPress={()=>linkTo("/setting")} />,[])
    return (
        <>
        <Layout navigation={navigation} withBack={false} title="Portalnesia" menu={menuToggle}>
            <Animated.View style={{position:'absolute',height:100,zIndex:1,top:containerPaddingTop,width: '100%',transform: [{translateY}]}}>
                <Lay level="1" style={{paddingVertical:10,paddingHorizontal:15,alignItems:'center',flexDirection:'row',elevation:5}}>
                    <Lay level="1" style={{marginRight:20}}><Avatar size={60} {...(user !== false ? {src:`${user?.picture}&watermark=no`} : {avatar:true})} /></Lay>
                    <Lay level="1" style={{marginRight:20}}>
                        <Text style={{fontWeight:'700'}}>{user!==false ? user?.name : "portalnesia.com"}</Text>
                        <Text style={{fontSize:12}}>{user !==false ? `@${user?.username}` : `© ${new Date().getFullYear()}`}</Text>
                    </Lay>
                    <Lay level="1" style={{flex:1}}>
                        <View style={{alignItems:'flex-end'}}><Button onPress={handleLogin}>{user === false ? "Login" : "Profile"}</Button></View>
                    </Lay>
                </Lay>
            </Animated.View>
            <Animated.ScrollView
				contentContainerStyle={{
                    paddingTop:containerPaddingTop + 100
				}}
                scrollIndicatorInsets={{
                    top:scrollIndicatorInsetTop + 100
                }}
                ref={ref}
                onScroll={onScroll}

			>
                {RenderMenu}
                <View style={{paddingLeft:15,paddingRight:15,paddingBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <Text style={{fontSize:12}} appearance="hint">{`v${Constants.nativeAppVersion}`}</Text>
                    <Text style={{fontSize:12}} appearance="hint">{`Portalnesia © ${new Date().getFullYear()}`}</Text>
                </View>
            </Animated.ScrollView>
        </Layout>
        <Backdrop loading visible={loading} onCancel={cancelCheckUpdates} />
        </>
    )
}

const _renderMenu=(dt,i,navigation,theme,checkUpdates,sendReport)=>{
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
                                <MenuItem key={`${i}-${ii}-${iii}`} title={()=><Text style={{marginLeft:15}}>{itt.title}</Text>} onPress={()=>itt.to ? linkTo(itt.to) : itt.link ? Linking.openURL(itt.link) : undefined} />
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
                        else if(it?.to === 'SendFeedback') sendReport('feedback');
                        else if(it.to) linkTo(it.to)
                        else if(it.link) {
                            if(!it.link?.match(/https?\:\/\/+/)) {
                                Linking.openURL(it.link)
                            } else {
                                openBrowser(it.link,false)
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