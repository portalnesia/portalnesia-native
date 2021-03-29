import React from 'react'
import {View , Alert,useWindowDimensions,ScrollView} from 'react-native'
import {useTheme,Layout as Lay, Text,Divider,MenuItem,ListItem,List,Menu, Icon} from '@ui-kitten/components'
import Modal from 'react-native-modal'
import RNFS from 'react-native-fs'

import Button from '@pn/components/global/Button'
import Backdrop from '@pn/components/global/Backdrop';
import Layout from '@pn/components/global/Layout'
import {AuthContext} from '@pn/provider/AuthProvider'
import { ucwords,number_size } from '@pn/utils/Main';

const ForwardIcon=(props)=><Icon {...props} name="arrow-ios-forward" />

const menuSetting=[
    {name:"Appearance"},
    {name:"Clear cache"}
]
const themeArr=['light','dark','auto'];


export default function Setting({navigation}){
    const context = React.useContext(AuthContext)
    const {setTheme,userTheme,setNotif} = context;
    const [open,setOpen]=React.useState(null)
    const {width} = useWindowDimensions()
    const theme = useTheme()
    const [cacheSize,setCacheSize]=React.useState("Calculating...")

    const indexTheme = React.useMemo(()=>{
        return themeArr.indexOf(userTheme)
    },[userTheme])

    const handleChangeTheme=value=>{
        setTheme(themeArr[value?.row])
    }

    React.useEffect(()=>{
        /*const calculateCacheOld=async (path=RNFS.CachesDirectoryPath)=>{
            const caches = await RNFS.readDir(path)
            await new Promise((res,rej)=>{
                if (caches?.length > 0) {
                    caches.forEach(async(cache, index) => {
                        if (cache.isFile()) {
                            totalSize += Number(cache.size)
                            res();
                        } else {
                            await calculateCache(`${cache.path}`)
                        }
                    })
                } else res();
            })
            //setCacheSize(totalSize===0 ? "0 KB" : number_size(totalSize))
        }*/
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
            await new Promise(res=>{
                caches.forEach(async(cache)=>{
                    await RNFS.unlink(`${RNFS.CachesDirectoryPath}/${cache}`);
                })
                res();
            })
            setNotif(false,"Success","Caches deleted");
            setCacheSize("0 KB")
        })
        .catch(()=>setNotif(true,"Error","Something went wrong"))
    }

    const renderItem=({item:dt,index:i})=>{
        let desc=undefined;
        let func=()=>dt?.to && navigation.navigate(dt?.to)
        if(dt?.name==="Clear cache") {
            desc=cacheSize;
            func = handleCacheDelete
        } else if(dt?.name==='Appearance') {
            desc=`${ucwords(userTheme==='auto' ? "device" : userTheme)} theme`
            func=()=>setOpen("theme");
        }

        return (
            <ListItem title={dt?.name} description={desc} style={{paddingHorizontal:15,paddingVertical:14}} key={`menu${i}`} accessoryRight={ForwardIcon} onPress={func} />
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
                            <MenuItem title="Light theme" style={{paddingHorizontal:13,paddingVertical:12}} />
                            <MenuItem title="Dark theme" style={{paddingHorizontal:13,paddingVertical:12}}  />
                            <MenuItem title="Use device theme" style={{paddingHorizontal:13,paddingVertical:12}} />
                        </Menu>
                    </View>
                </Lay>
            </Modal>
        </>
    )
}