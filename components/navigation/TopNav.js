import React from 'react';
import {resetRoot} from '@pn/navigation/useRootNavigation'
import {useNavigationState} from '@react-navigation/native'
import {Icon,Divider, TopNavigation,Text,useTheme} from '@ui-kitten/components'
import TopNavigationAction from './TopAction'
import i18n from 'i18n-js'

const BackIcon=(props)=>(
	<Icon {...props} name='arrow-back' />
)
const CloseIcon=(props)=>(
	<Icon {...props} name='close' />
)

export default function({withBack,title,menu,navigation,align,subtitle,withClose,whiteBg,margin}){
	const index = useNavigationState(state=>state.index);
	const theme = useTheme()

	const RenderBackBtn=()=>{
		if(withClose) {
			return(
				<TopNavigationAction tooltip={i18n.t('close')} icon={CloseIcon} onPress={() => {{
					if(index > 0) {
						navigation.goBack();
					} else {
						resetRoot();
					}
				}}} />
			)
		} else if(withBack) {
			return(
				<TopNavigationAction tooltip={i18n.t('back')} icon={BackIcon} onPress={() => {{
					if(index > 0) {
						navigation.goBack();
					} else {
						resetRoot();
					}
				}}} />
			)
		}
		else return null;
	}

	return(
		<>
		<TopNavigation 
			{...(withClose && !whiteBg ? {style:{backgroundColor:theme['background-basic-color-2']}} : {})}
			title={evaProps => <Text {...evaProps}  category="h1" style={{...evaProps?.style,marginLeft:(align=='start' ? 10 : 50),marginRight:(margin ? 50 + margin : 50)}} numberOfLines={1}>{title}</Text>}
			{...(typeof subtitle === 'string' && subtitle?.length > 0 ? {subtitle:(evaProps)=><Text {...evaProps} style={{...evaProps?.style,marginLeft:(align=='start' ? 10 : 50),marginRight:(margin ? 50 + margin : 50)}} numberOfLines={1}>{subtitle}</Text>} : {})}
			alignment={align}
			{...(withBack || withClose ? {accessoryLeft:()=><RenderBackBtn /> } : {})}
			{...(menu ? {accessoryRight:menu} : {})}
		/>
		{withClose && whiteBg ? null : <Divider />}
		</>
	)
}

/*export default function (props) {
	return (
		<View>
			<View
				style={{
					paddingHorizontal: 20,
					height: 64,
					flexDirection: 'row',
					justifyContent: 'space-between',
					backgroundColor: '#fff',
					alignItems: 'center',
					borderColor: '#c0c0c0',
					borderBottomWidth: 1,
				}}
			>
				{props.withBack ? (
					<TouchableOpacity
						onPress={() => {
							props.navigation.goBack();
						}}
						style={{
							flex: 1,
							alignItems: 'flex-start',
							justifyContent: 'center',
						}}
					>
						<Ionicons name="ios-arrow-back" size={24} color="#000" />
					</TouchableOpacity>
				) : (
					<View style={{ flex: 1, alignItems: 'flex-start' }} />
				)}

				<View
					style={{
						alignItems: 'center',
						flex: 5,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Text
						bold
						style={{
							color: Colors.topNavText,
							fontSize: 16,
						}}
					>
						{props.title}
					</Text>
				</View>
				<View
					style={{
						alignItems: 'flex-end',
						flex: 1,
						justifyContent: 'center',
					}}
				></View>
			</View>
		</View>
	);
}
*/