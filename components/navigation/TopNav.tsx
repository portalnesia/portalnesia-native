import React from 'react';
import {resetRoot} from '@pn/navigation/useRootNavigation'
import {Icon,Divider, TopNavigation,Text,useTheme, TextProps} from '@ui-kitten/components'
import TopNavigationAction from './TopAction'
import i18n from 'i18n-js'
import { useNavigationState } from '@react-navigation/core';
import { Alert, BackHandler } from 'react-native';

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
    navigation?: any;
    /**
     * Title of header
     */
    title?: React.ReactText|React.FunctionComponent;
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
	accessoryLeft?():JSX.Element;
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

export const RenderBackBtn=React.memo(({withClose,withBack,navigation}: Pick<TopNavigationProps,'withBack'|'withClose'|'navigation'>)=>{
	const index = useNavigationState(state=>state.index)
	const handleBack=React.useCallback(()=>{
		if(navigation) {
			if(navigation?.canGoBack() && index > 0) {
				navigation.goBack();
			} else {
				resetRoot();
			}
		}
	},[navigation,index])

	if(withClose) {
		return(
			<TopNavigationAction tooltip={i18n.t('close')} icon={CloseIcon} onPress={handleBack} />
		)
	} else if(withBack) {
		return(
			<TopNavigationAction tooltip={i18n.t('back')} icon={BackIcon} onPress={handleBack} />
		)
	}
	else return null;
})

export default RenderBackBtn;