//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	View,
} from 'react-native';
import {Spinner} from '@ui-kitten/components'
import Layout from '../../components/global/Layout';
//import Text from '../../components/utils/UbuntuFont';
//import Colors from '../../constants/colors';
export default function ({ navigation }) {
	return (
		<Layout navigation={navigation}>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* This text using ubuntu font */}
				<Spinner size="giant" />
			</View>
		</Layout>
	);
}
