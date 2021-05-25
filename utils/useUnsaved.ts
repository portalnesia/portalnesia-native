import React from 'react'
import {Alert} from 'react-native'
import {useNavigation,EventMapCore,ParamListBase,EventListenerCallback} from '@react-navigation/native'
import {NavigationRoute} from '@react-navigation/routers/src/types'
import i18n from 'i18n-js'

export default function useUnsaved(initialCanBack=true){
    const navigation = useNavigation();
    const [canBack,setCanBack]=React.useState(initialCanBack);

    React.useEffect(()=>{
        const backHandler: EventListenerCallback<EventMapCore<Readonly<{
            key: string;
            index: number;
            routeNames: string[];
            history?: unknown[] | undefined;
            routes: NavigationRoute<ParamListBase, string>[];
            type: string;
            stale: false;
        }>>, "beforeRemove">=(e)=>{
            if(canBack) return;
            e.preventDefault();

            Alert.alert(
				i18n.t('errors.sure'),
				"Changes you made may not be saved",
				[{
					text:i18n.t('cancel'),
					onPress:()=>{}
				},{
					text:"OK",
					onPress:()=>navigation.dispatch(e.data.action)
				}]
			)
        }

        navigation.addListener('beforeRemove',backHandler)

        return()=>{
            navigation.removeListener('beforeRemove',backHandler)
        }
    },[navigation,canBack])

    return setCanBack;
}