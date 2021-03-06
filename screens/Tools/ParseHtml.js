import React from 'react';
import {  ScrollView,useWindowDimensions,KeyboardAvoidingView } from 'react-native';
import {Layout as Lay,Text,Input,useTheme} from '@ui-kitten/components'
import i18n from 'i18n-js'

import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners,showInterstisial} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import {randomInt} from '@portalnesia/utils'
import Portalnesia from '@portalnesia/react-native-core'
import ShareModule from '@pn/module/Share';

export default function({navigation,route}){
    const initialType = route.params?.initialType;
    const initialData = route.params?.initialData;
    const {PNpost} = useAPI(false)
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [open,setOpen]=React.useState(false)
    const [input,setInput] = React.useState("")
    const [loading,setLoading] = React.useState(false)
    const {height,width}=useWindowDimensions()
    const theme = useTheme()
    const {showAds} = showInterstisial()

    const handleReset=()=>setInput("")

    const handleParse=(input)=>()=>{
        if(input.match(/\S+/) === null) return setNotif(true,"Error","HTML cannot be empty");
        Portalnesia.Safetynet.verifyWithRecaptcha()
        .then(async(recaptcha)=>{
            setLoading(true);
            return await PNpost(`/parse_html`,{html:input,recaptcha},undefined,true,false)
        })
        .then((res)=>{
            if(!res?.error) {
                if(randomInt(3) == 0) showAds();
                setInput(res.encode);
            }
        })
        .catch((e)=>{
            setNotif(true,"Error",e?.message);
        })
        .finally(()=>{
            setLoading(false)
        })
    }

    React.useEffect(()=>{
        const dataListener = (data)=>{
            if(typeof data?.data === 'string') {
                setInput(data?.data)
                setTimeout(()=>handleParse(data?.data)(),500);
            }
        }
        ShareModule.getSharedData().then(dataListener).catch(console.log)
        ShareModule.addListener(dataListener)
        return ()=>ShareModule.removeListener(dataListener);
    },[])

    const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{setOpen(true)}} />,[]);

    return (
        <>
            <Layout navigation={navigation} title="Parse HTML" subtitle="Tools" withBack menu={menuToggle}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow:1,
                        backgroundColor:theme['background-basic-color-1']
                    }}
                    keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                >
                    <Lay key={0} style={{paddingTop:10}}>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text>Use this online converter to parse your adsense, chitika, adbrite and any HTML code into XML code compatible with all the Blogger templates or other blogs systems.</Text>
                        </Lay>
                        <AdsBanner />
                        <KeyboardAvoidingView pointerEvents="box-none" behavior="height">
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Input
                                label="HTML"
                                value={input}
                                onChangeText={(text)=>setInput(text)}
                                multiline
                                disabled={loading}
                                textStyle={{minHeight:200,maxHeight:400}}
                                textAlignVertical="top"
                                placeholder="&lt;p class=&quot;class-example&quot;&gt;Text Example&lt;/p&gt;"
                            />
                        </Lay>
                        </KeyboardAvoidingView>
                        <Lay style={{marginVertical:10}}>
                            <AdsBanners size="MEDIUM_RECTANGLE" />
                        </Lay>
                        <Lay style={{flex:1,justifyContent:'flex-end',flexDirection:'column'}}>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button disabled={loading} status="danger" onPress={handleReset}>Reset</Button>
                            </Lay>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button loading={loading} disabled={loading} onPress={handleParse(input)} >Parse</Button>
                            </Lay>
                        </Lay>
                    </Lay>
                </ScrollView>
            </Layout>
            <MenuContainer
                visible={open}
                handleOpen={()=>setOpen(true)}
                handleClose={()=>setOpen(false)}
                onClose={()=>setOpen(false)}
                type="tools"
                item_id="parse_html"
                share={{
                    link:`/parse-html?utm_campaign=tools`,
                    title:`Parse HTML - Portalnesia`
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
        </>
    )
}