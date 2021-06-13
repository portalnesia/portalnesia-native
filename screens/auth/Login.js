import React, { useState } from 'react';
import {Alert,ScrollView,TouchableOpacity,View,StyleSheet,Dimensions} from 'react-native'
import Image from 'react-native-fast-image'
import {useTheme,Layout as Lay, Text,Input,Icon, Divider} from '@ui-kitten/components'
import {loadAsync} from 'expo-auth-session'
import Modal from 'react-native-modal'
import * as GoogleAuth from 'expo-google-sign-in';

import {Markdown} from '@pn/components/global/Parser'
import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import Pressable from '@pn/components/global/Pressable'
import NotFoundScreen from '../NotFound'
import { AuthContext } from '@pn/provider/Context';
import {getProfile,exchangeToken,discovery,loginConfig,loginInit} from '@pn/utils/Login';
import Recaptcha from '@pn/components/global/Recaptcha'
import useAPI from '@pn/utils/API';
import { getLocation, reverseGeocode } from '@pn/utils/Location';
import i18n from 'i18n-js';
import Authentication from '@pn/module/Authentication';
import GoogleSignInButton from '@pn/components/global/GoogleSignInButton';
import {FIREBASE_CLIENT_ID,FIREBASE_WEB_CLIENT_ID} from '@env';
import Backdrop from '@pn/components/global/Backdrop';
import getInfo from '@pn/utils/Info';

const {width} = Dimensions.get('window')

const info = getInfo();

export default function LoginScreen({ navigation,route }) {
	const context = React.useContext(AuthContext)
	const {state,setNotif,theme:selectedTheme} = context;
	const {user} = state;
	if(user) return <NotFoundScreen navigation={navigation} route={route} />

	const {PNpost} = useAPI();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(null);
	const text2 = React.useRef(null)
	const [recaptcha,setRecaptcha] = useState("");
	const captchaRef = React.useRef(null)
	const [dialog,setDialog]=useState(null);

	async function getLoginLocation(){
		const {coords:{latitude,longitude}} = await getLocation();
		const loc = await reverseGeocode({latitude,longitude})
		const location = JSON.stringify(loc[0]);
		const request = await loadAsync(loginConfig,discovery);
		return {location,request};
	}

	async function handleLogin() {
		let error=[];
		if(email.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.email`)}/${i18n.t(`form.username`)}`}))
		if(password.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.password`)}`}))
		if(error.length > 0) return setNotif(true,"Error",error.join("\n"));

		setLoading('login');
		try {
			const {location,request}=await getLoginLocation();
			let res;
			try {
				res = await PNpost('/auth/login',{email,password,recaptcha,location,code_challenge:request.codeChallenge,device:JSON.stringify(info)})
			} catch(e){}
			if(res?.dialog) {
				setDialog(res?.dialog);
			}
			if(res?.error===0) {
				if(typeof res?.code === 'string') {
					const token = await exchangeToken(res?.code,request)
					if(token?.accessToken) {
						const profile = await getProfile(token);
						if(typeof profile !== 'string') {
							await loginInit(token,profile);
							Authentication.addAccount(profile?.email,token?.refreshToken,token?.accessToken);
						} else {
							setNotif(true,"Error",profile);
						}
					}
				} else if(res?.action === 'authentication') {
					navigation.replace("Authentication",{telegram:res?.telegram,token:res?.token,codeVerifier:request.codeVerifier,userid:res?.userid,sms:res?.sms})
				}
			}
		} catch(e) {
			if(e?.message) setNotif(true,"Error",e?.message);
		} finally {
			setLoading(null);
            captchaRef.current?.refreshToken();
		}
	}

	const handleGoogleLogin=React.useCallback(async()=>{
		setLoading('google')
		try {
			await GoogleAuth.initAsync({
				clientId:FIREBASE_CLIENT_ID,
				webClientId:FIREBASE_WEB_CLIENT_ID,
				isOfflineEnabled:false,
				isPromptEnabled:true,
			})
			await GoogleAuth.getPlayServiceAvailability(true);
			const {type,user} = await GoogleAuth.signInAsync();
			if(type==='success') {
				let res;
				const {location,request}=await getLoginLocation();
				const body = {accessToken:user.auth.accessToken||"",idToken:user.auth.idToken||"",location,code_challenge:request.codeChallenge,recaptcha,device:JSON.stringify(info)};
				try {
					res = await PNpost('/auth/google/login',body)
				} catch(e){
					console.log(e);
				} finally {
					captchaRef.current?.refreshToken();
				}
				if(res?.dialog) {
					Alert.alert(
						res?.msg,
						res?.dialog,
						[{
							text:"OK",
							onPress:()=>{}
						}]
					)
				}
				try{
					await GoogleAuth.disconnectAsync();
				} catch(e){}
				if(res?.error===0) {
					if(typeof res?.code === 'string') {
						const token = await exchangeToken(res?.code,request)
						if(token?.accessToken) {
							const profile = await getProfile(token);
							if(typeof profile !== 'string') {
								await loginInit(token,profile);
								Authentication.addAccount(profile?.email,token?.refreshToken,token?.accessToken,restart);
							} else {
								setNotif(true,"Error",profile);
							}
						}
					} else if(res?.action === 'authentication') {
						navigation.replace("Authentication",{telegram:res?.telegram,token:res?.token,codeVerifier:request.codeVerifier,userid:res?.userid,sms:res?.sms})
					}
				}
			}
		} catch(e){
			setNotif(true,"Error",e?.message||i18n.t('errors.general'))
		} finally {
			setLoading(null)
		}
	},[PNpost,recaptcha])

	return (
		<>
			<Layout navigation={navigation} whiteBg>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
					keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Image
							resizeMode="contain"
							style={{
								height: 220,
								width: 220,
							}}
							source={require('../../assets/login.png')}
						/>
					</View>
					<View
						style={{
							flex: 3,
							paddingHorizontal: 20,
							paddingBottom: 20,
						}}
					>
						<Text
							style={{
								fontSize: 24,
								alignSelf: 'center',
								padding: 20,
								fontFamily:"Inter_Bold"
							}}
						>
							Login
						</Text>
						<Text style={{ fontSize: 16 }}>{`${i18n.t('form.email')}/${i18n.t('form.username')}`}</Text>
						<View>
							<Input
								style={styles.textInput}
								placeholder="example@portalnesia.com"
								placeholderStyle={{
									fontFamily: 'Inter_Regular',
								}}
								value={email}
								autoCapitalize="none"
								autoCompleteType="off"
								autoCorrect={false}
								blurOnSubmit={false}
								returnKeyType="next"
								onChangeText={(text) => setEmail(text)}
								disabled={loading!==null}
								onSubmitEditing={()=>text2?.current?.focus()}
							/>
						</View>
						<Text style={{ marginTop: 15, fontSize: 16 }}>
							{i18n.t('form.password')}
						</Text>
						<View>
							<Input
								ref={text2}
								style={styles.textInput}
								placeholder="Enter your password"
								placeholderStyle={{
									fontFamily: 'Inter_Regular',
								}}
								value={password}
								autoCapitalize="none"
								autoCompleteType="off"
								autoCorrect={false}
								secureTextEntry={true}
								returnKeyType="send"
								textContentType="password"
								onChangeText={(text) => setPassword(text)}
								onSubmitEditing={handleLogin}
								disabled={loading!==null}
							/>
						</View>
						<Button size="medium" disabled={loading!==null} loading={loading==='login'} style={{marginTop:20}} onPress={handleLogin}>Continue</Button>
						
						<View style={{flexDirection:'row',marginTop:10}}>
							<GoogleSignInButton disabled={loading!==null} size={GoogleSignInButton.SIZE.WIDE} style={{flex:1,width:'100%'}} color={selectedTheme==='dark' ? GoogleSignInButton.Color.DARK : GoogleSignInButton.Color.LIGHT} onPress={handleGoogleLogin} />
						</View>

						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginTop: 25,
								justifyContent: 'center',
							}}
						>
							<Text style={{marginRight:5}}>
								Don't have an account?
							</Text>
							<TouchableOpacity
								onPress={() => {
									navigation.navigate('Register');
								}}
								activeOpacity={0.7}
							>
								<Text {...(loading!==null ? {appearance:"hint"} : {style:{textDecorationLine:"underline"},status:"info"})}>
									Register here
								</Text>
							</TouchableOpacity>
						</View>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginTop: 15,
								justifyContent: 'center',
							}}
						>
							<TouchableOpacity
								onPress={() => {
									navigation.navigate('ForgetPassword');
								}}
								activeOpacity={0.7}
							>
								<Text {...(loading !== null ? {appearance:"hint"} : {style:{textDecorationLine:"underline"},status:"info"})}>
									Forget password
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</Layout>
			<Backdrop loading visible={loading==='google'} />
			<Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} action="login" />
			<Modal
                isVisible={dialog!==null}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
				coverScreen={false}
            >

				<RenderInput onClose={()=>setDialog(null)} dialog={dialog} />
			</Modal>
		</>
	);
}

const RenderInput=React.memo(({onClose,dialog})=>{
	const theme=useTheme();
	return (
		<Lay style={{padding:10,width:width-50,borderRadius:10}}>
			<View style={{marginHorizontal:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
				<Text category="h5">Warning</Text>
				<View style={{borderRadius:22,overflow:'hidden'}}>
					<Pressable style={{padding:10}} onPress={()=> onClose && onClose()}>
						<Icon style={{width:24,height:24,tintColor:theme['text-hint-color']}} name="close-outline" />
					</Pressable>
				</View>
			</View>
			<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
			<View>
				{typeof dialog==='string' && <Markdown source={dialog} /> }
			</View>
		</Lay>
	)
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	textInput: {
		textAlign: 'left',
		paddingVertical:10,
		flex: 1,
		fontFamily: 'Inter_Regular',
	},
});