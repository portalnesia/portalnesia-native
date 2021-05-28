import React from 'react';
import {Alert,ScrollView,TouchableOpacity,View,StyleSheet} from 'react-native'
import Image from 'react-native-fast-image'
import {useTheme,Layout as Lay, Text,Input} from '@ui-kitten/components'
import {loadAsync} from 'expo-auth-session'

import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import NotFoundScreen from '../NotFound'
import { AuthContext } from '@pn/provider/Context';
import {getProfile,exchangeToken,discovery,loginConfig,loginInit} from '@pn/utils/Login';
import Recaptcha from '@pn/components/global/Recaptcha'
import useAPI from '@pn/utils/API';
import i18n from 'i18n-js';

let mWait=30,interval=null;

export default function AuthenticationScreen({ navigation,route }) {
	const context = React.useContext(AuthContext)
	const {state,setNotif,dispatch} = context;
	const {user} = state;
	const {token,codeVerifier,telegram,userid} = route?.params;
	
	if(user || !token || !codeVerifier) return <NotFoundScreen navigation={navigation} route={route} />
	const {PNpost} = useAPI();
	const [wait,setWait] = React.useState(mWait)
	const [code, setCode] = React.useState("");
	const [loading, setLoading] = React.useState(null);
	const [recaptcha,setRecaptcha] = React.useState("");
	const captchaRef = React.useRef(null)
	const [recaptchaL,setRecaptchaL] = React.useState("");
	const captchaRefL = React.useRef(null)

	function handleSendTelegram() {
		setLoading('telegram');
		PNpost('/backend/authenticator/telegram',{recaptcha,id:userid})
		.then(res=>{
			if(!Boolean(res?.error)) {
				if(interval !== null) clearInterval(interval);
				interval = setInterval(()=>{
					if(mWait === 0) {
						clearInterval(interval);
						interval=null;
						mWait=30;
						setWait(30);
					} else {
						mWait--;
						setWait(mWait);
					}
				},1000)
				setNotif(false,"Code sent");
			}
		})
		.finally(()=>{
			setLoading(null);
            captchaRef.current?.refreshToken();
		})
	}

	React.useEffect(()=>{
		
		return()=>{
			if(interval !== null) clearInterval(interval);
			setWait(30)
			mWait=30;
			interval=null;
		}
	},[])

	async function handleVerify() {
		if(code.trim().match(/\S/) === null) setNotif(true,"Error",i18n.t('errors.form_validation',{type:`${i18n.t(`form.verification_code`)}`}))
		setLoading('verify');
		try {
			let res;
			try {
				res = await PNpost('/auth/authentication',{recaptcha:recaptchaL,code,token})
			} catch(e){}
			if(res?.error==0) {
				if(res?.code) {
					const token = await exchangeToken(res?.code,{codeVerifier})
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
				}
			}

		} catch(e) {
			console.log(e)
			if(e?.message) setNotif(true,"Error",e?.message);
		} finally {
            setLoading(null);
            captchaRefL.current?.refreshToken();
		}
		
	}

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
						<View style={{marginBottom:45}}>
							<Text
								style={{
									fontSize: 24,
									alignSelf: 'center',
									padding: 20,
									fontFamily:"Inter_Bold"
								}}
							>
								Authentication
							</Text>
						</View>
						<Text style={{ fontSize: 16 }}>{i18n.t(`form.verification_code`)}</Text>
						<View>
							<Input
								style={styles.textInput}
								placeholder="123456"
								textStyle={{fontSize:18}}
								value={code}
								keyboardType="number-pad"
								textContentType="oneTimeCode"
								maxLength={6}
								autoCapitalize="none"
								autoCompleteType="off"
								autoCorrect={false}
								returnKeyType="send"
								onChangeText={setCode}
								onSubmitEditing={handleVerify}
								disabled={loading!==null}
							/>
						</View>

						{telegram==true && (
							<View style={{marginBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
								<TouchableOpacity
									onPress={handleSendTelegram}
									disabled={loading!==null||wait!==30}
									activeOpacity={0.7}
								>
									<Text {...(loading!==null||wait!==30 ? {appearance:"hint"} : {style:{textDecorationLine:"underline"},status:"info"})}>
										Send code to telegram
									</Text>
								</TouchableOpacity>
								{wait < 30 && <Text>{`${wait}s`}</Text> }
							</View>
						)}

						<Button disabled={loading!==null} loading={loading==='verify'} onPress={handleVerify} style={{marginTop:20}}>{i18n.t("send")}</Button>
					</View>
				</ScrollView>
			</Layout>
			<Recaptcha ref={captchaRefL} onReceiveToken={setRecaptchaL} action="login" />
			<Recaptcha ref={captchaRef} onReceiveToken={setRecaptcha} />
		</>
	);
}
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
