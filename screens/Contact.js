import React from 'react';
import {  View,ScrollView,KeyboardAvoidingView,Linking,Alert } from 'react-native';
import {Layout as Lay,Text,Spinner,Input,useTheme,Icon } from '@ui-kitten/components'
//import useSWR from '@pn/utils/swr'

//import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
//import Pagination from '@pn/components/global/Pagination'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/Context';
import {CONTENT_URL,URL} from '@env'
import { openBrowser, ucwords } from '@pn/utils/Main';
import verifyRecaptcha from '@pn/module/Recaptcha'
import i18n from 'i18n-js';
import useSelector from '@pn/provider/actions'

const user=null;

const dataContact=[
    {
        icon:['email','material'],
        link:"mailto:support@portalnesia.com",
        label:'support@portalnesia.com',
        target:true
    },
    {
        icon:['facebook','font_awesome'],
        link:"/fb",
        label:'Portalnesia'
    },
    {
        icon:['twitter','font_awesome'],
        link:"/tw",
        label:'@Portalnesia1'
    },
    {
        icon:['line','font_awesome'],
        link:"/ln",
        label:'@540ytcnc',
        bot:true
    },
    {
        icon:['telegram','font_awesome'],
        link:"/tg",
        label:'@portalnesia_bot',
        bot:true
    }
]

export default function Contact({navigation,route}){
    const subject = route.params?.subject
    const {PNpost} = useAPI(false)
    const user = useSelector(state=>state.user);
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const {copyText} = useClipboard()
    const [input,setInput] = React.useState({name:user===false ?'':user?.name,email:user===false ? '' : user.email,subject:'',message:''})
    const [loading,setLoading] = React.useState(false)
    const theme = useTheme()
    const [result,setResult]=React.useState(null)
    const emailRef=React.useRef(null)
    const subjectRef=React.useRef(null)
    const msgRef=React.useRef(null)

    const handleInputChange=(name)=>val=>{
        setInput(prev=>({...prev,[name]:val}))
    }

    const handleSubmit=()=>{
        const arrInput = Object.keys(input);
        let checkError=[];
        arrInput.map((inp)=>{
            if(input[inp].trim().match(/\S/) === null) checkError.push(i18n.t('errors.form_validation',{type:i18n.t(`form.${inp}`)}))
        })
        if(checkError.length > 0) return setNotif(true,"Error",checkError.join("\n"));
        
        setLoading(true);
        verifyRecaptcha(setNotif)
        .then(grecaptcha=>{
            return PNpost('/messages/add',{...input,grecaptcha})
        })
        .then(res=>{
            if(!res.error) {
                setInput(prev=>({...prev,subject:'',message:''}));
                Alert.alert(
                    "Message Sent",
                    (user===null ? 
                        "Please check your email for message detail.\nIf you don't see an email from us, please check your spam folder." : 
                        "You can see your message anytime in support pages"   
                    )
                    ,
                    [
                        {
                            title:"OK",
                            onPress:()=>{}
                        }
                    ]
                )
            }
        })
        .finally(()=>{
            setLoading(false)
        })
    }

    React.useEffect(()=>{
        if(subject) setInput({...input,subject:decodeURIComponent(subject)})
    },[])

    return (
        <>
            <Layout navigation={navigation} title="Contact" withBack>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        backgroundColor:theme['background-basic-color-1']
                    }}
                >
                    <Lay>
                        <Lay key={0} style={{paddingTop:20}}>
                            <Lay style={[style.container]}>
                                <Text>If you have questions, criticisms, or suggestions, you can contact us at our official accounts:</Text>
                                <View style={{marginBottom:25}}>
                                    {dataContact.map((dt,i)=>(
                                        <View key={i} style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
                                            <View style={{marginTop:3}}>
                                                <Icon name={dt?.icon[0]} pack={dt?.icon[1]} style={{height:18,tintColor:theme['text-basic-color']}} />
                                            </View>
                                            <Text style={{marginLeft:10,textDecorationLine:'underline'}} onPress={()=>{
                                                if(dt?.target) {
                                                    return Linking.openURL(dt?.link)
                                                } else {
                                                    return openBrowser(URL + dt?.link,false);
                                                }
                                            }}>{`${dt?.label}${dt?.bot ? ` (BOT)` : ""}`}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={{marginBottom:10}}>For a faster response, you should contact us via email or please fill out the form bellow:</Text>
                                <KeyboardAvoidingView>
                                <Lay {...(user!==false ? {pointerEvents:'none'} : {})}>
                                        <Input
                                            label={i18n.t('form.name')}
                                            value={input.name}
                                            onChangeText={handleInputChange('name')}
                                            disabled={loading}
                                            editable={user===false}
                                            placeholder="John Doe"
                                            returnKeyType="next"
                                            onSubmitEditing={()=>emailRef?.current?.focus()}
                                            autoCapitalize="words"
                                            autoCompleteType="name"
                                            textContentType="name"
                                            blurOnSubmit={false}
                                            enablesReturnKeyAutomatically
                                        />
                                    </Lay>
                                    <Lay {...(user!==false ? {pointerEvents:'none'} : {})}>
                                        <Input
                                            label={i18n.t('form.email')}
                                            value={input.email}
                                            onChangeText={handleInputChange('email')}
                                            disabled={loading}
                                            editable={user===false}
                                            ref={emailRef}
                                            keyboardType="email-address"
                                            autoCompleteType="email"
                                            enablesReturnKeyAutomatically
                                            placeholder="example@portalnesia.com"
                                            textContentType="emailAddress"
                                            returnKeyType="next"
                                            onSubmitEditing={()=>subjectRef?.current?.focus()}
                                            blurOnSubmit={false}
                                        />
                                    </Lay>
                                    <Lay>
                                        <Input
                                            label="Subject"
                                            value={input.subject}
                                            onChangeText={handleInputChange('subject')}
                                            disabled={loading}
                                            returnKeyType="next"
                                            autoCompleteType="off"
                                            ref={subjectRef}
                                            onSubmitEditing={()=>msgRef?.current?.focus()}
                                            blurOnSubmit={false}
                                            enablesReturnKeyAutomatically
                                        />
                                    </Lay>
                                    <Lay>
                                        <Input
                                            label="Messages"
                                            value={input.message}
                                            onChangeText={handleInputChange('message')}
                                            disabled={loading}
                                            ref={msgRef}
                                            multiline
                                            textStyle={{minHeight:150,maxHeight:350}}
                                            textAlignVertical="top"
                                            enablesReturnKeyAutomatically
                                        />
                                    </Lay>
                                </KeyboardAvoidingView>
                            </Lay>
                            <Lay style={{justifyContent:'flex-end'}}>
                                <Lay style={[style.container,{paddingVertical:5,paddingBottom:15}]}>
                                    <Button loading={loading} disabled={loading} onPress={handleSubmit}>Send</Button>
                                </Lay>
                            </Lay>
                        </Lay>
                    </Lay>
                </ScrollView>
            </Layout>

        </>
    )
}