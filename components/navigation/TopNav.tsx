import React from 'react';
import {resetRoot} from '@pn/navigation/useRootNavigation'
import {useNavigationState} from '@react-navigation/native'
import {Icon,Divider, TopNavigation,Text,useTheme, TextProps} from '@ui-kitten/components'
import TopNavigationAction from './TopAction'
import i18n from 'i18n-js'

export interface TopNavigationProps {
    /**
     * with background level = 1
     * default false | background lebel = 2;
     */
    whiteBg?: boolean;
    /**
     * Render back icon if left header
     */
    withBack?: boolean;
    /**
     * Render close icon if left header
     */
    withClose?: boolean;
    navigation: any;
    /**
     * Title of header
     */
    title?: React.ReactText;
    /**
     * Subtitle of header
     */
    subtitle?: React.ReactText;
    /**
     * Right menu in header
     */
    menu?: ()=>React.ReactElement;
    margin?: number;
    align?: 'center'|'start'
    withDivider?: boolean;
    style?: Record<string,any>
}

type StyleIcon = {
    style: Record<string, any>;
}

const BackIcon=(props?: StyleIcon)=>(
	<Icon {...props} name='arrow-back' />
)
const CloseIcon=(props?: StyleIcon)=>(
	<Icon {...props} name='close' />
)

export default function(props: TopNavigationProps){
    const {withBack,title,menu,navigation,align,subtitle,withClose,whiteBg,margin,withDivider,style}=props;
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
				{...(withClose && !whiteBg ? {style:{backgroundColor:theme['background-basic-color-2'],...style}} : {style})}
				title={(evaProps) => <Text {...evaProps}  category="h1" style={{...evaProps?.style,marginLeft:(align=='start' ? 10 : 50),marginRight:(margin ? 50 + margin : 50)}} numberOfLines={1}>{title}</Text>}
				{...(typeof subtitle === 'string' && subtitle?.length > 0 ? {subtitle:(evaProps)=><Text {...evaProps} style={{...evaProps?.style,marginLeft:(align=='start' ? 10 : 50),marginRight:(margin ? 50 + margin : 50)}} numberOfLines={1}>{subtitle}</Text>} : {})}
				alignment={align}
				{...(withBack || withClose ? {accessoryLeft:()=><RenderBackBtn /> } : {})}
				{...(menu ? {accessoryRight:menu} : {})}
			/>
			{(withClose && whiteBg) || withDivider===false ? null : <Divider />}
		</>
	)
}