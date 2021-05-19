import React from 'react'
import {View , Alert,useWindowDimensions,FlatList} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,MenuItem,Menu, Icon} from '@ui-kitten/components'
import Modal from 'react-native-modal'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import Backdrop from '@pn/components/global/Backdrop';
import {startActivityAsync,ACTION_APP_NOTIFICATION_SETTINGS} from 'expo-intent-launcher'

//import Button from '@pn/components/global/Button'
import Layout from '@pn/components/global/Layout'
import {AuthContext} from '@pn/provider/Context'
import { ucwords,number_size } from '@pn/utils/Main';
import useLogin from '@pn/utils/Login'
import ListItem from '@pn/components/global/ListItem'

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const menuSettingArr=[
    {key:"notification"},
    {key:"appearance"},
    {key:"lang"},
    {key:"cache"}
]
const themeArr=['light','dark','auto'];
const langArr=['auto','id','en'];
const langTitle=['System language','Bahasa Indonesia','English'];

export default function Setting({navigation}){
    const context = React.useContext(AuthContext)
    const {setTheme,userTheme,setNotif,state,lang,setLang,dispatch} = context;
    const {user} = state;
    const [open,setOpen]=React.useState(null)
    const [loading,setLoading] = React.useState(false)
    const {width} = useWindowDimensions()
    const theme = useTheme()
    const [cacheSize,setCacheSize]=React.useState("Calculating...")
    const {logout} = useLogin({dispatch,state,setNotif});

    const indexTheme = React.useMemo(()=>{
        return themeArr.indexOf(userTheme)
    },[userTheme])

    const indexLang = React.useMemo(()=>{
        return langArr.indexOf(lang)
    },[lang])

    const menuSetting = React.useMemo(()=>{
        if(user !== false) {
            return [...menuSettingArr,
                {key:"logout",name:"Logout"}
            ]
        } else {
            return menuSettingArr;
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
            let totalSize=0;
            totalSize += await calculateFolderSize(RNFS.CachesDirectoryPath);
            setCacheSize(totalSize===0 ? "0 KB" : number_size(totalSize))
        })()
    },[])

    const handleCacheDelete=React.useCallback(async()=>{
        RNFS.readdir(RNFS.CachesDirectoryPath)
        .then(async(caches)=>{
            for(const cache of caches) {
                await RNFS.unlink(`${RNFS.CachesDirectoryPath}/${cache}`);
            }
            setNotif(false,"Success",i18n.t('deleted',{type:"Caches"}));
            setCacheSize("0 KB")
        })
        .catch(()=>setNotif(true,"Error",i18n.t('errors.general')))
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
                    await logout();
                    setLoading(false);
                }
            }]
        )
    },[user])

    const openNotification = React.useCallback(async()=>{
        if(user===true) {

        } else {
            await startActivityAsync(ACTION_APP_NOTIFICATION_SETTINGS,{extra:{"android.provider.extra.APP_PACKAGE":"com.portalnesia.app"}});
        }
    },[user])

    const renderItem=({item:dt,index:i})=>{
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
            func=openNotification
        }

        return (
            <ListItem title={name} description={desc} key={`menu${i}`} accessoryRight={ForwardIcon} onPress={func} />
        )
    }

    return (
        <>
            <Layout navigation={navigation} title={i18n.t('setting')} withBack >
                <Lay>
                    <FlatList
                        data={menuSetting}
                        renderItem={renderItem}
                        ItemSeparatorComponent={Divider}
                        contentContainerStyle={{
                            backgroundColor:theme['background-color-basic-1']
                        }}
                    />
                </Lay>
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