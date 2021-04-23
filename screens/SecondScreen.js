import React from 'react';
import Layout from '../components/global/Layout';
import RNFS from 'react-native-fs'
import {useNavigationState} from '@react-navigation/native'
import {useTheme} from '@ui-kitten/components'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import * as IntentLauncher from 'expo-intent-launcher'

import Loading from './utils/Loading'
import Portalnesia from '@pn/module/Portalnesia'
import {AuthContext} from '@pn/provider/Context'

export default function ({ navigation,route }) {
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
		const type = route?.params?.type

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

		async function openFile() {
			try {
				const file = decodeURIComponent(route?.params?.file);
				const mime = decodeURIComponent(route?.params?.mime);
				const fileUri = await Portalnesia.uriToFileProvider(`${RNFS.ExternalStorageDirectoryPath}/Portalnesia/${file}`);
				await IntentLauncher.startActivityAsync("android.intent.action.VIEW",{
					type:mime,
					data: fileUri,
					flags:1
				})
				goBack();
			} catch(e) {
				console.log(e)
				goBack();
			}
		}

        if(type==='update_app') checkIsUpdate();
		else if(type==='open_file') openFile();
		else goBack();

    },[route])

	return (
		<Layout navigation={navigation} title="Portalnesia" withBack>
			<Loading />
		</Layout>
	);
}
