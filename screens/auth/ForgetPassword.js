import React, { useState } from 'react';
import {Alert,ScrollView,TouchableOpacity,View,StyleSheet} from 'react-native'
import {useTheme,Layout as Lay, Text,Input} from '@ui-kitten/components'
import Image from '@pn/module/FastImage'

import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import NotFoundScreen from '../NotFound'
import i18n from 'i18n-js';
import useAPI from '@pn/utils/API';
import Recaptcha from '@pn/components/global/Recaptcha'
import { getLocation, reverseGeocode } from '@pn/utils/Location';
import getInfo from '@pn/utils/Info';
import useSelector from '@pn/provider/actions'

const info = getInfo();

export default function ForgetPasswordScreen({ navigation,route }) {
	const user = useSelector(state=>state.user);
	if(user) return <NotFoundScreen navigation={navigation} route={route} />

	const context = React.useContext(AuthContext)
	const {setNotif} = context;
	const {PNpost} = useAPI();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const text2 = React.useRef(null)
	const captchaRef = React.useRef(null)

	async function handleForget() {
		let error=[];
		if(email.trim().match(/\S/) === null) error.push(i18n.t('errors.form_validation',{type:`${i18n.t(`form.email`)}`}))
		if(error.length > 0) return setNotif(true,"Error",error.join("\n"));

		setLoading(true);
		try {
			const {coords:{latitude,longitude}} = await getLocation();
			const loc = await reverseGeocode({latitude,longitude});
			const recaptcha = await captchaRef.current.getToken();
			const res = await PNpost('/auth/forget',{forgot_email:email,recaptcha,location:JSON.stringify(loc[0]),device:JSON.stringify(info)})
			if(!Boolean(res?.error)) {
				setEmail("")
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
		} finally {
			setLoading(false);
		}
	}

	const handleNavigation=React.useCallback((screen)=>()=>{
		navigation.navigate(screen)
	},[navigation])

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
							source={require('../../assets/forget.png')}
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
							Forget Password
						</Text>
						<Text style={{ fontSize: 16 }}>{i18n.t('form.email')}</Text>
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
								onSubmitEditing={handleForget}
								returnKeyType="send"
							/>
						</View>

						<Button disabled={loading} loading={loading} style={{marginTop:20}} onPress={handleForget}>Send Email</Button>

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
								onPress={handleNavigation("Login")}
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
