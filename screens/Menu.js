import React from 'react'
import {Animated,Image,View,LogBox,Alert} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider, MenuGroup,MenuItem,Menu, Icon,TopNavigationAction} from '@ui-kitten/components'
import * as Linking from 'expo-linking'
import {openBrowserAsync} from 'expo-web-browser'

import Button from '@pn/components/global/Button'
import Backdrop from '@pn/components/global/Backdrop';
import Layout from '@pn/components/global/Layout'
import Avatar from '@pn/components/global/Avatar'
import {AuthContext} from '@pn/provider/AuthProvider'
import {menu} from '../constants/menu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import {Constants} from 'react-native-unimodules'
import useAPI from '@pn/utils/API'
import RNFS from 'react-native-fs'


LogBox.ignoreLogs(['VirtualizedLists should']);

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />
const SettingIcon=(props)=><Icon {...props} name="settings-outline" />

export default function({navigation}){
    const auth = React.useContext(AuthContext)
    const {setNotif} = auth;
    const {user} = auth.state
    const {PNget} = useAPI(false)
    const theme = useTheme()
    const heightt = {...headerHeight,sub:100}
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub + 20
    const [loading,setLoading] = React.useState(false)

    const debug = async()=>{
        console.log(await RNFS.stat(`${RNFS.CachesDirectoryPath}`));
    }

    const checkUpdates=()=>{
        setLoading(true)
        PNget('/check_update')
        .then((res)=>{
            if(!res.error) {
                if(res?.data?.version != Constants.nativeAppVersion || res?.data?.versionCode != Constants.nativeBuildVersion) {
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
                            onPress:()=>{
                                openBrowserAsync(url,{
                                    enableDefaultShare:true,
                                    toolbarColor:'#2f6f4e',
                                    showTitle:true
                                })
                            }
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
    }

    return (
        <>
        <Layout navigation={navigation} >
            <Animated.View style={{position:'absolute',backgroundColor: theme['color-basic-100'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title="Portalnesia" navigation={navigation} height={56} menu={()=><TopNavigationAction icon={SettingIcon} onPress={()=>navigation.navigate("Setting")} />}>
                    <Lay level="1" style={{height:100,paddingVertical:10,paddingHorizontal:15,alignItems:'center',flexDirection:'row'}}>
                        <Lay level="1" style={{marginRight:20}}><Avatar avatar size={60} /></Lay>
                        <Lay level="1" style={{marginRight:20}}>
                            <Text style={{fontWeight:'700'}}>portalnesia.com</Text>
                            <Text style={{fontSize:12}}>{`© ${new Date().getFullYear()}`}</Text>
                        </Lay>
                        <Lay level="1" style={{flex:1}}>
                            <View style={{alignItems:'flex-end'}}><Button onPress={()=>setNotif(true,"Under Maintenance","Sorry, this feature is under maintenance")}>Login</Button></View>
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