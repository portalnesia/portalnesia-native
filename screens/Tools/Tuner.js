import React from 'react';
import {  View,ScrollView,Dimensions,PermissionsAndroid } from 'react-native';
import {Layout as Lay,Text,Card,Input,List,ListItem,Divider,useTheme} from '@ui-kitten/components'
import i18n from 'i18n-js'
import remoteConfig from '@react-native-firebase/remote-config'

import Tuner from '@pn/components/tuner/Tuner'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button';

const textAnnounce = "Thank you for your patience.\n\nThis feature is experimental and can only be used by a few users.\nIt may cause the application to lag or even hang.\nWe're still trying to optimize it.\n\nIf you get the chance to try this feature, don't forget to leave feedback :)";

export default function TuenrScreen({navigation,route}){
    const [menu,setMenu] = React.useState(false);
    const [start,setStart] = React.useState(false);
    const [enabled,setEnabled] = React.useState(false);

    React.useEffect(()=>{
        const enabled = remoteConfig().getValue('tuner_enabled')
        if(enabled.asBoolean() === true) {
            setEnabled(true)
        }
    },[])

    const startTuner=React.useCallback(()=>{
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        .then((granted)=>{
            if(granted !== PermissionsAndroid.RESULTS.GRANTED) {
                navigation?.goBack();
            } else {
                setStart(true);
            }
        })
    },[navigation])

    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{setMenu(true)}} />,[]);

    return (
        <>
            <Layout navigation={navigation} title="Tuner" subtitle="Tools" withBack menu={menuToggle}>
                <ScrollView contentContainerStyle={{flex:1}}>
                    <Lay><AdsBanner /></Lay>
                    <Lay style={[style.container,{paddingTop:15,flexGrow:1,flexShrink:1}]}>
                        {start ? <Tuner start={start} /> 
                        : (
                            <Lay style={{flex:1,justifyContent:'center'}}>
                                <Lay style={{alignItems:'center',marginBottom:15}}>
                                     <Text category="h4" style={{fontFamily:"Inter_Bold"}}>Experimental Features</Text>
                                </Lay>
                                <Lay style={{alignItems:'center'}}>
                                    <Text>{textAnnounce}</Text>
                                </Lay>
                                <Lay style={{alignItems:'flex-end',marginTop:15}}>
                                    <Text>Regards,</Text>
                                    <Text style={{fontFamily:"Inter_Medium",marginTop:15}}>Portalnesia</Text>
                                </Lay>
                                {enabled || __DEV__ ? (
                                    <Lay style={{alignItems:'center',marginTop:55,flexDirection:'row'}}>
                                        <Button size="medium" onPress={startTuner} style={{flexShrink:1,flexGrow:1}}>Start Tuner</Button>
                                    </Lay>
                                ) : null}
                            </Lay>
                        )}
                    </Lay>
                </ScrollView>
            </Layout>
            <MenuContainer
                visible={menu}
                onClose={()=>setMenu(false)}
                type="tools"
                item_id="tuner"
                share={{
                    title:`Tuner - Portalnesia`
                }}
                menu={[{
                    title:i18n.t('feedback'),
                    action:'feedback'
                }]}
            />
        </>
    )
}