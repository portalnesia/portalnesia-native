import React from 'react';
import {  View,ScrollView,useWindowDimensions,KeyboardAvoidingView } from 'react-native';
import {Layout as Lay,Text,Card,Spinner,Input,List,ListItem,Divider,useTheme,Toggle} from '@ui-kitten/components'


//import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/AuthProvider';
import Recaptcha from '@pn/components/global/Recaptcha'

export default function({navigation}){
    const {PNpost} = useAPI(false)
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [input,setInput] = React.useState("")
    const [recaptcha,setRecaptcha]=React.useState("");
    const [loading,setLoading] = React.useState(false)
    const {height,width}=useWindowDimensions()
    const theme = useTheme()
    const captcha = React.useRef(null)

    const onReceiveToken=(token)=>{
        setRecaptcha(token)
    }

    const handleReset=()=>setInput("")

    const handleParse=()=>{
        if(input.match(/\S+/) === null) return setNotif(true,"Error","HTML cannot be empty");
        setLoading(true);
        PNpost(`/parse_html`,{html:input,recaptcha})
        .then((res)=>{
            setInput(res.encode);
        })
        .finally(()=>{
            setLoading(false)
            captcha?.current?.refreshToken()
        })
    }

    return (
        <>
            <Layout navigation={navigation} title="Parse HTML" subtitle="Tools" withBack>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow:1,
                        backgroundColor:theme['background-basic-color-1']
                    }}
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
                            <AdsBanners />
                        </Lay>
                        <Lay style={{flex:1,justifyContent:'flex-end',flexDirection:'column'}}>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button disabled={loading} status="danger" onPress={handleReset}>Reset</Button>
                            </Lay>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button loading={loading} disabled={loading} onPress={handleParse} >Parse</Button>
                            </Lay>
                        </Lay>
                    </Lay>
                </ScrollView>
            </Layout>
            <Recaptcha ref={captcha} onReceiveToken={onReceiveToken} />
        </>
    )
}