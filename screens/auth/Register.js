import React, { useState } from 'react';
import {Alert,ScrollView,TouchableOpacity,View,StyleSheet} from 'react-native'
import {useTheme,Layout as Lay, Text,Input} from '@ui-kitten/components'
import Image from '@pn/module/FastImage'
import analytics from '@react-native-firebase/analytics'

import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import NotFoundScreen from '../NotFound'
import i18n from 'i18n-js';
import useAPI from '@pn/utils/API';
import Recaptcha from '@pn/components/global/Recaptcha'
import useSelector from '@pn/provider/actions'

export default function RegisterScreen({ navigation,route }) {
	const user = useSelector(state=>state.user);
	if(user) return <NotFoundScreen navigation={navigation} route={route} />

	const context = React.useContext(AuthContext)
	const {setNotif} = context;
	const {PNpost} = useAPI();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const text2 = React.useRef(null)
	const captchaRef = React.useRef(null)

	function register() {
		let error=[];
		if(username.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.username`)}`}))
		if(email.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.email`)}`}))
		if(error.length > 0) return setNotif(true,"Error",error.join("\n"));
		
		setLoading(true);
		captchaRef.current.getToken()
		.then(recaptcha=>{
			return PNpost('/auth/register',{email,username,recaptcha})
		})
		.then(res=>{
			if(!Boolean(res?.error)) {
				setEmail("")
				setUsername("");
				Alert.alert(
					"Success",
					res?.msg,
					[
						{
							text:"OK",
							onPress:()=>navigation.navigate("Login")
						}
					]
				)
			}
		})
		.finally(()=>{
			analytics().logSignUp({method:'portalnesia.com'})
			setLoading(false);
		})
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
							source={require('../../assets/register.png')}
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
								padding: 30,
								fontFamily:"Inter_Bold"
							}}
						>
							Register
						</Text>
						<Text style={{ fontSize: 16 }}>{i18n.t('form.username')}</Text>
						<View>
							<Input
								style={styles.textInput}
								placeholder="portalnesia"
								placeholderStyle={{
									fontFamily: 'Inter_Regular',
								}}
								value={username}
								autoCapitalize="none"
								autoCompleteType="username"
								textContentType="username"
								autoCorrect={false}
								returnKeyType="next"
								onChangeText={setUsername}
								onSubmitEditing={()=>text2?.current?.focus()}
								blurOnSubmit={false}
							/>
						</View>
						<Text style={{ marginTop: 15, fontSize: 16 }}>{i18n.t('form.email')}</Text>
						<View>
							<Input
								ref={text2}
								style={styles.textInput}
								placeholder="example@portalnesia.com"
								placeholderStyle={{
									fontFamily: 'Inter_Regular',
								}}
								value={email}
								autoCapitalize="none"
								autoCompleteType="email"
								textContentType="emailAddress"
								keyboardType="email-address"
								onChangeText={setEmail}
								onSubmitEditing={register}
								returnKeyType="send"
							/>
						</View>

						<Button disabled={loading} loading={loading} style={{marginTop:20}} onPress={register}>Create an account</Button>

						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginTop: 15,
								justifyContent: 'center',
							}}
						>
							<Text>
								Already have an account?
							</Text>
							<TouchableOpacity
								onPress={() => {
									navigation.navigate("Login")
								}}
								activeOpacity={0.7}
							>
								<Text
									style={{
										marginLeft: 5,
										...(loading ? {} : {textDecorationLine:"underline"})
									}}
									{...(loading ? {appearance:"hint"} : {status:"info"})}
								>
									Login here
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</Layout>
			<Recaptcha ref={captchaRef} action="login" />
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
