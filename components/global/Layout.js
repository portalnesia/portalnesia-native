//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import TopNav from '../navigation/TopNav';
import {Layout as Lay} from '@ui-kitten/components'
//import Text from '../utils/UbuntuFont';
const Laylay = (props)=>{
	
	return (
		<Lay style={styles.container} {...(props.whiteBg ? {level:"1"} : {level:"2"})}>
			{props.custom ? props.custom : props.title || props.withClose ? (
				<TopNav
					navigation={props.navigation}
					title={props.title}
					withBack={props.withBack ? true : false}
					align={props.align}
					subtitle={props.subtitle}
					menu={props.menu}
					withClose={props.withClose}
				/>
			) : null}

			{/* this text using ubuntu font */}
			{props.children}
		</Lay>
	);
}
Laylay.defaultProps={
	title:undefined,
	withBack:true,
	align:'center'
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
});
export default Laylay