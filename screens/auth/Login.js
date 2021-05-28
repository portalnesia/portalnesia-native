import React, { useState } from 'react';
import {Alert,ScrollView,TouchableOpacity,View,StyleSheet,Dimensions} from 'react-native'
import Image from 'react-native-fast-image'
import {useTheme,Layout as Lay, Text,Input,Icon, Divider} from '@ui-kitten/components'
import {loadAsync} from 'expo-auth-session'
import Modal from 'react-native-modal'

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

const {width} = Dimensions.get('window')

export default function LoginScreen({ navigation,route }) {
	const context = React.useContext(AuthContext)
	const {state,setNotif,dispatch} = context;
	const {user} = state;
	if(user) return <NotFoundScreen navigation={navigation} route={route} />

	const {PNpost} = useAPI();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const text2 = React.useRef(null)
	const [recaptcha,setRecaptcha] = useState("");
	const captchaRef = React.useRef(null)
	const [dialog,setDialog]=useState(null);

	//React.useEffect(()=>console.log(recaptcha),[recaptcha])

	async function handleLogin() {
		let error=[];
		if(email.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.email`)}/${i18n.t(`form.username`)}`}))
		if(password.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.password`)}`}))
		if(error.length > 0) return setNotif(true,"Error",error.join("\n"));

		setLoading(true);
		try {
			const {coords:{latitude,longitude}} = await getLocation();
			const loc = await reverseGeocode({latitude,longitude})
			const location = JSON.stringify(loc[0]);
			const request = await loadAsync(loginConfig,discovery);
			let res;
			try {
				res = await PNpost('/auth/login',{email,password,recaptcha,location,code_challenge:request.codeChallenge})
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
							dispatch({type:"LOGIN",payload:{user:profile,token:token,session:profile?.session_id}})
							setNotif(false,"Logged in",`Welcome back, ${profile?.username}`);
							navigation?.goBack();
						} else {
							setNotif(true,"Error",profile);
						}
					}
				} else if(res?.action === 'authentication') {
					navigation.replace("Authentication",{telegram:res?.telegram,token:res?.token,codeVerifier:request.codeVerifier,userid:res?.userid})
				}
			}
		} catch(e) {
			if(e?.message) setNotif(true,"Error",e?.message);
		} finally {
			setLoading(false);
            captchaRef.current?.refreshToken();
		}
	}

	return (
		<>
			<Layout navigation={navigation} whiteBg withClose>
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
								disabled={loading}
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
								disabled={loading}
							/>
						</View>
						<Button disabled={loading} loading={loading} style={{marginTop:20}} onPress={handleLogin}>Continue</Button>

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
								<Text {...(loading ? {appearance:"hint"} : {style:{textDecorationLine:"underline"},status:"info"})}>
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
								<Text {...(loading ? {appearance:"hint"} : {style:{textDecorationLine:"underline"},status:"info"})}>
									Forget password
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</Layout>
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
