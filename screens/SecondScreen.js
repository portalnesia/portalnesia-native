import React from 'react';
import Layout from '../components/global/Layout';
import RNFS from 'react-native-fs'
import {useNavigationState} from '@react-navigation/native'
import {useTheme} from '@ui-kitten/components'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'

import Loading from './utils/Loading'
import Portalnesia from '@pn/module/Portalnesia'
import {AuthContext} from '@pn/provider/Context'

export default function ({ navigation,route }) {
	const type = route?.params?.type
	const index = useNavigationState(state=>state.index);
	const auth = React.useContext(AuthContext);
	const {theme:selectedTheme} = auth;
	const theme=useTheme()

	React.useEffect(()=>{
		setStatusBarStyle('light')
		setStatusBarBackgroundColor(theme['color-primary-500']);

		return ()=>{
			setStatusBarStyle(selectedTheme==='light' ? "dark" : "light")
			setStatusBarBackgroundColor(theme['background-basic-color-1']);
		}
	},[])

	React.useEffect(()=>{
		function goBack(){
			if(index > 0) {
				navigation.goBack();
			} else {
				navigation.reset({
					index:0,
					routes:[{name:"Main",screen:"MainTabs"}]
				})
			}
		}

        async function checkIsUpdate() {
			//`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/app-arm64-v8a-debug.apk`;
			const fileApk =`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/Portalnesia.apk`;
            const exists = await RNFS.exists(fileApk);
            if(exists) {

                try {
                    const a = await Portalnesia.installApkView(fileApk)
                    goBack();
                } catch(e){
                    console.log(e)
					goBack();
                }
            } else goBack();
        }

        if(type==='update_app') checkIsUpdate();
		else goBack();

    },[type])

	return (
		<Layout navigation={navigation} title="Portalnesia" withBack>
			<Loading />
		</Layout>
	);
}
