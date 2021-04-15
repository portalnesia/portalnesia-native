import React from 'react'
import {View , Alert,useWindowDimensions,ScrollView} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,MenuItem,ListItem,List,Menu, Icon} from '@ui-kitten/components'
import Modal from 'react-native-modal'
import RNFS from 'react-native-fs'
import i18n from 'i18n-js'
import Backdrop from '@pn/components/global/Backdrop';

//import Button from '@pn/components/global/Button'
import Layout from '@pn/components/global/Layout'
import {AuthContext} from '@pn/provider/Context'
import { ucwords,number_size } from '@pn/utils/Main';
import useLogin from '@pn/utils/Login'

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const menuSettingArr=[
    {name:"Appearance"},
    {name:"Clear cache"}
]
const themeArr=['light','dark','auto'];


export default function Setting({navigation}){
    const context = React.useContext(AuthContext)
    const {setTheme,userTheme,setNotif,state} = context;
    const {user} = state;
    const [open,setOpen]=React.useState(null)
    const [loading,setLoading] = React.useState(false)
    const {width} = useWindowDimensions()
    const theme = useTheme()
    const [cacheSize,setCacheSize]=React.useState("Calculating...")
    const {logout} = useLogin();

    const indexTheme = React.useMemo(()=>{
        return themeArr.indexOf(userTheme)
    },[userTheme])

    const menuSetting = React.useMemo(()=>{
        if(user !== false) {
            return [...menuSettingArr,
                {name:"Logout"}
            ]
        } else {
            return menuSettingArr;
        }
    },[user])

    const handleChangeTheme=value=>{
        setTheme(themeArr[value?.row])
    }

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

    const handleCacheDelete=async()=>{
        RNFS.readdir(RNFS.CachesDirectoryPath)
        .then(async(caches)=>{
            for(const cache of caches) {
                await RNFS.unlink(`${RNFS.CachesDirectoryPath}/${cache}`);
            }
            setNotif(false,"Success",i18n.t('deleted',{type:"Caches"}));
            setCacheSize("0 KB")
        })
        .catch(()=>setNotif(true,"Error",i18n.t('error')))
    }

    const handleLogout=()=>{
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
    }

    const renderItem=({item:dt,index:i})=>{
        let desc=undefined,name='';
        let func=()=>dt?.to && navigation.navigate(dt?.to)
        if(dt?.name==="Clear cache") {
            name=i18n.t('clear',{type:"cache"});
            desc=cacheSize;
            func = handleCacheDelete
        } else if(dt?.name==='Appearance') {
            name=i18n.t('appearance');
            tema_type=`${ucwords(userTheme==='auto' ? i18n.t("device") : i18n.t(userTheme))}`
            desc=i18n.t('theme_type',{type:tema_type});
            func=()=>setOpen("theme");
        } else if(dt?.name == 'Logout') {
            name="Logout";
            func=handleLogout
        }

        return (
            <ListItem title={name} description={desc} style={{paddingHorizontal:15,paddingVertical:14}} key={`menu${i}`} accessoryRight={ForwardIcon} onPress={func} />
        )
    }

    return (
        <>
            <Layout navigation={navigation} title="Setting" withBack >
                <View>
                    <List
                        data={menuSetting}
                        renderItem={renderItem}
                        ItemSeparatorComponent={Divider}
                    />
                </View>
            </Layout>
            <Modal
                isVisible={open==='theme'}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                onBackdropPress={()=>setOpen(null)}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <Lay style={{width:width-50,borderRadius:10,paddingVertical:10}}>
                    <View>
                        <Menu
                            selectedIndex={{row:indexTheme}}
                            onSelect={handleChangeTheme}
                            contentContainerStyle={{flexGrow:1}}
                        >
                            <MenuItem title={i18n.t('theme_type',{type:i18n.t('light')})} style={{paddingHorizontal:13,paddingVertical:12}} />
                            <MenuItem title={i18n.t('theme_type',{type:i18n.t('dark')})} style={{paddingHorizontal:13,paddingVertical:12}}  />
                            <MenuItem title={i18n.t('theme_type',{type:i18n.t('device')})} style={{paddingHorizontal:13,paddingVertical:12}} />
                        </Menu>
                    </View>
                </Lay>
            </Modal>
            <Backdrop loading visible={loading} />
        </>
    )
}