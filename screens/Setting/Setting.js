import React from 'react'
import {View , Alert,useWindowDimensions,FlatList} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,MenuItem,Menu, Icon} from '@ui-kitten/components'
import Modal from 'react-native-modal'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import Backdrop from '@pn/components/global/Backdrop';
import {startActivityAsync,ACTION_APP_NOTIFICATION_SETTINGS} from 'expo-intent-launcher'
import {Constants} from 'react-native-unimodules'

//import Button from '@pn/components/global/Button'
import Layout from '@pn/components/global/Layout'
import {AuthContext} from '@pn/provider/Context'
import { ucwords,number_size } from '@portalnesia/utils';
import useLogin from '@pn/utils/Login'
import ListItem from '@pn/components/global/ListItem'
import { linkTo } from '@pn/navigation/useRootNavigation'
import Authentication from '@pn/module/Authentication';
import useSelector from '@pn/provider/actions'
import Portalnesia from '@portalnesia/react-native-core'
import { getSaf } from '@pn/utils/Download'
import FastImage from '@pn/module/FastImage'

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const menuSettingArr=[
    {key:"appearance"},
    {key:"lang"},
    {key:"directory"},
    {key:"cache"},
    {header:"About"},
    {key:"contact",desc:false,to:"/contact"},
    {key:"terms_of_service",desc:false,to:"/pages/terms-of-service?navbar=Terms of Service"},
    {key:"privacy_policy",desc:false,to:"/pages/privacy-policy?navbar=Privacy Policy"},
    {key:"open_source_libraries",desc:false,to:"/opensource"},
]
const themeArr=['light','dark','auto'];
const langArr=['auto','id','en'];
const langTitle=['System language','Bahasa Indonesia','English'];

export default function Setting({navigation}){
    const context = React.useContext(AuthContext)
    const {setTheme,setNotif,setLang} = context;
    const {user,userTheme,lang} = useSelector(state=>({user:state.user,userTheme:state.userTheme,lang:state.lang}))
    const [open,setOpen]=React.useState(null)
    const [loading,setLoading] = React.useState(false)
    const [storage,setStorage] = React.useState("Loading...");
    const {width} = useWindowDimensions()
    const theme = useTheme()
    const [cacheSize,setCacheSize]=React.useState("Calculating...")
    const {logout} = useLogin(setNotif);

    const indexTheme = React.useMemo(()=>{
        return themeArr.indexOf(userTheme)
    },[userTheme])

    const indexLang = React.useMemo(()=>{
        return langArr.indexOf(lang)
    },[lang])

    const menuSetting = React.useMemo(()=>{
        if(user) {
            const newArr=[...menuSettingArr,
                {key:"logout"}
            ];
            newArr.unshift(
                {header:"Account"},
                {key:"account",to:"/setting/account"},
                {key:"security",to:"/setting/security"},
                {key:"notification",to:"/setting/notification"},
                {header:"General"}
            );
            return newArr;
        } else {
            const newArr=[...menuSettingArr];
            newArr.unshift(
                {header:"General"},
                {key:"notification"},
            );
            return newArr;
        }
    },[user])

    const handleChangeTheme=React.useCallback(async(value)=>{
        await setTheme(themeArr[value?.row])
    },[])

    const handleChangeLang=React.useCallback(async(value)=>{
        await setLang(langArr[value?.row])
    },[])

    React.useEffect(()=>{
        async function childCalculate(caches){
            let localSize=0;
            if (caches?.length > 0) {
                for(const cache of caches) {
                    if (cache.isFile()) {
                        localSize += Number(cache.size)
                    } else {
                        localSize += await calculateFolderSize(`${cache.path}`)
                    }
                }
            }
            return localSize;
        }
        async function calculateFolderSize(path){
            let localSize=0;
            const caches = await RNFS.readDir(path)
            localSize += await childCalculate(caches)
            return localSize
        }

        (async function(){
            const saf = await getSaf(false,true);
            if(saf===null) {
                setStorage(`${i18n.t("errors.not_set")}`);
            } else {
                const path = await Portalnesia.Files.getRealPathFromSaf(saf);
                setStorage(`${path}`)
            }
            let totalSize=0;
            totalSize += await calculateFolderSize(RNFS.CachesDirectoryPath);
            setCacheSize(totalSize===0 ? "0 KB" : number_size(totalSize))
        })()
    },[])

    const handleCacheDelete=React.useCallback(()=>{
        setLoading(true);
        return Promise.all(
            FastImage.clearDiskCache,
            FastImage.clearMemoryCache
        )
        .then(()=>RNFS.readdir(RNFS.CachesDirectoryPath))
        .then(async(caches)=>{
            for(const cache of caches) {
                await RNFS.unlink(`${RNFS.CachesDirectoryPath}/${cache}`);
            }
            setNotif(false,"Success",i18n.t('deleted',{type:"Caches"}));
            setCacheSize("0 KB")
        })
        .catch(()=>setNotif(true,"Error",i18n.t('errors.general')))
        .finally(()=>setLoading(false));
    },[])

    const handleLogout=React.useCallback(()=>{
        Alert.alert(
            "Are you sure?",
            `Logout @${user?.username}`,
            [{
                text:"Cancel",
                onPress:()=>{}
            },{
                text:"Logout",
                onPress:async()=>{
                    setLoading(true);
                    await Promise.all([
                        Authentication.oneTapSignOut(),
                        logout()
                    ]);
                    setLoading(false);
                }
            }]
        )
    },[user])

    const handleStorage=React.useCallback(async()=>{
        try {
            const saf = await getSaf(true);
            const path = await PNFile.getRealPathFromSaf(saf);
            setStorage(`${path}`);
        } catch(e) {
            
        }
    },[])

    const openNotification = React.useCallback(async()=>{
        if(user) {
            linkTo("/setting/notification");
        } else {
            await startActivityAsync(ACTION_APP_NOTIFICATION_SETTINGS,{extra:{"android.provider.extra.APP_PACKAGE":"com.portalnesia.app"}});
        }
    },[user])

    const renderItem=({item:dt,index:i})=>{
        if(dt?.header) {
            return (
                <Lay level="2" style={{paddingTop:15,paddingBottom:5,paddingHorizontal:15}} key={`header-${i}`}>
                    <Text appearance="hint">{dt?.header}</Text>
                </Lay>
            )
        }
        let desc=undefined,name='';
        let func=()=>dt?.to && navigation.navigate(dt?.to)
        if(dt?.key==="cache") {
            name=i18n.t('clear',{type:"cache"});
            desc=cacheSize;
            func = handleCacheDelete
        } else if(dt?.key==='appearance') {
            name=i18n.t('appearance');
            tema_type=`${ucwords(userTheme==='auto' ? i18n.t("device") : i18n.t(userTheme))}`
            desc=i18n.t('theme_type',{type:tema_type});
            func=()=>setOpen("theme");
        } else if(dt?.key == 'logout') {
            name="Logout";
            func=handleLogout
        } else if(dt?.key==='lang') {
            name = i18n.t('language');
            desc = langTitle[indexLang];
            func = ()=>setOpen("lang");
        } else if(dt?.key =='notification') {
            name=ucwords(i18n.t('notification',{count:2}));
            desc=ucwords(i18n.t('setting_type',{type:i18n.t('notification',{count:2})}))
            func=openNotification
        } else if(dt?.to) {
            name=ucwords(i18n.t(dt?.key,{count:1}));
            if(dt?.desc !== false) desc=ucwords(i18n.t('setting_type',{type:i18n.t(dt?.key,{count:1})}))
            func=()=>linkTo(dt?.to)
        } else if(dt?.key==='directory') {
            name=ucwords(i18n.t("settings.storage_location"));
            desc=storage;
            func=handleStorage
        } 

        return (
            <ListItem title={name} description={desc} key={`menu${i}`} accessoryRight={ForwardIcon} onPress={func} />
        )
    }

    const renderFooter=React.useCallback(()=>(
        <Lay level="2" style={{paddingHorizontal:15,paddingBottom:20,paddingTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{fontSize:12}} appearance="hint">{`v${Constants.nativeAppVersion}`}</Text>
            <Text style={{fontSize:12}} appearance="hint">{`Portalnesia © ${new Date().getFullYear()}`}</Text>
        </Lay>
    ),[])

    return (
        <>
            <Layout navigation={navigation} title={i18n.t('setting')} withBack >
                <FlatList
                    data={menuSetting}
                    renderItem={renderItem}
                    ListFooterComponent={renderFooter}
                    ItemSeparatorComponent={Divider}
                    contentContainerStyle={{
                        backgroundColor:theme['background-basic-color-1'],
                    }}
                    keyExtractor={(item)=>item?.key ? `key-${item?.key}` : `header-${item?.header}`}
                />
            </Layout>
            <Modal
                isVisible={open!==null}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                onBackdropPress={()=>setOpen(null)}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <Lay style={{width:width-50,borderRadius:10,paddingVertical:10}}>
                    <View>
                        {open === 'theme' ? (
                            <Menu
                                selectedIndex={{row:indexTheme}}
                                onSelect={handleChangeTheme}
                                contentContainerStyle={{flexGrow:1}}
                            >
                                {themeArr.map((dt,i)=>{
                                    const i18 = dt === 'auto' ? 'device' : dt;
                                    return <MenuItem key={i.toString()} title={i18n.t('theme_type',{type:i18n.t(i18)})} style={{paddingHorizontal:13,paddingVertical:12}} />
                                })}
                            </Menu>
                        ) : open === 'lang' ? (
                            <Menu
                                selectedIndex={{row:indexLang}}
                                onSelect={handleChangeLang}
                                contentContainerStyle={{flexGrow:1}}
                            >
                                {langArr.map((dt,i)=> <MenuItem key={i.toString()} title={langTitle[i]} style={{paddingHorizontal:13,paddingVertical:12}} /> )}
                            </Menu>
                        ) : null}
                    </View>
                </Lay>
            </Modal>
            <Backdrop loading visible={loading} />
        </>
    )
}