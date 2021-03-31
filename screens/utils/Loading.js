//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	View,
	Dimensions
} from 'react-native';
import {Spinner} from '@ui-kitten/components'
import LottieView from 'lottie-react-native'
const {width,height} = Dimensions.get('window')
//import Text from '../../components/utils/UbuntuFont';
//import Colors from '../../constants/colors';
export default function ({ navigation }) {
	return (
		<View
			style={{
				zIndex:999,
				position:'absolute',
				top:0,
				left:0,
				right:0,
				bottom:0,
				width,
				height,
				flex: 1,
				alignItems: 'center',
				backgroundColor:'#2f6f4e',
				justifyContent: 'center',
			}}
		>
			<LottieView source={require('@pn/assets/animation/app-starting.json')} autoPlay loop />
		</View>
	);
}
