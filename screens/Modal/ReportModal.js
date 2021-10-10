import React from 'react'
import {View,PermissionsAndroid} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Icon} from '@ui-kitten/components'
import i18n from 'i18n-js'
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas'
import RNFS from 'react-native-fs'

import TopAction from '@pn/components/navigation/TopAction'
import Pressable from '@pn/components/global/Pressable'
import Layout from '@pn/components/global/Layout';
import { AuthContext } from '@pn/provider/Context'
import { ucwords } from '@portalnesia/utils'

const CloseIcon=(props)=>(
	<Icon {...props} name='close' />
)
const CheckIcon=(props)=>(
	<Icon {...props} name='checkmark' />
)

async function saveBase64(data,filename) {
    await RNFS.writeFile(filename, data, 'base64');
}

export default function ReportScreen({navigation,route}){
    const context = React.useContext(AuthContext)
    const {setNotif}=context;
    const {uri,...other} = route?.params
    const [selected,setSelected]=React.useState('highlight')
    const [disable,setDisable]=React.useState(true);
    const theme = useTheme();
    const ref = React.useRef(null)

    const selectedColor=React.useMemo(()=>{
        if(selected === 'highlight') return 'rgba(251, 255, 5,0.3)'
        else return '#000000';
    },[selected])

    const handleSave=()=>{
        if(disable){
            navigation?.goBack()
        } else {
            ref?.current?.getBase64('png',true,true,false,true,(err,data)=>{
                if(err !== null) {
                    setNotif(true,"Error",err);
                } else {
                    saveBase64(data,uri)
                    .then(()=>{
                        navigation?.navigate("ReportScreen",{uri,...other})
                    })
                }
            })
        }
        
    }

    const handleDisable=React.useCallback((count)=>{
        if(count > 0) setDisable(false);
        else setDisable(true)
    },[])

    return (
        <Layout navigation={navigation}>
            <Lay style={{paddingHorizontal:5,height:56,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <TopAction icon={CloseIcon} tooltip={i18n.t('close')} onPress={()=>navigation?.goBack()} />
                <Lay style={{flexDirection:'row',justifyContent:'center',alignItems:'center',flexGrow:1,flexShrink:1}}>
                    <View style={{borderRadius:18,overflow:'hidden',marginLeft:10}}>
                        <Pressable style={{padding:2}} tooltip="Highlight" onPress={()=>setSelected('highlight')} >
                            <View style={{backgroundColor:'rgb(251, 255, 5)',...(selected==='highlight' ? {borderColor:theme['color-primary-500'],borderWidth:2,height:32,width:32,borderRadius:16} : {height:30,width:30,borderRadius:15})}} />
                        </Pressable>
                    </View>
                    <View style={{borderRadius:18,overflow:'hidden',marginLeft:10}}>
                        <Pressable style={{padding:2}} tooltip="Hide" onPress={()=>setSelected('hide')}>
                            <View style={{backgroundColor:'#000',...(selected==='hide' ? {borderColor:theme['color-primary-500'],borderWidth:2,height:32,width:32,borderRadius:16} : {height:30,width:30,borderRadius:15})}} />
                        </Pressable>
                    </View>
                    <View style={{borderRadius:18,overflow:'hidden',marginLeft:10}}>
                        <Pressable disabled={disable} style={{padding:10}} tooltip="Undo" onPress={()=>ref?.current?.undo()}>
                        <Icon style={{width:15,height:15,tintColor:disable ? theme['text-hint-color'] : theme['text-basic-color']}} name="undo" pack="font_awesome" />
                        </Pressable>
                    </View>
                </Lay>
                <TopAction icon={CheckIcon} tooltip={ucwords(i18n.t('save'))} onPress={handleSave} />
            </Lay>
            <Divider />
            <Lay style={{flex:1}} level="4">
                <SketchCanvas
                    ref={ref}
                    style={{flex:1}}
                    strokeColor={selectedColor}
                    strokeWidth={20}
                    localSourceImage={{filename:uri.replace('file://','')}}
                    onPathsChange={handleDisable}
                />
            </Lay>
        </Layout>
    )
}