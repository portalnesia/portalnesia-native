import React from 'react';
import Layout from '../components/global/Layout';
import {useNavigationState} from '@react-navigation/native'
import {useTheme} from '@ui-kitten/components'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import Loading from './utils/Loading'
import useSelector from '@pn/provider/actions'
import PNFile from '@pn/module/PNFile'

export default function ({ navigation,route }) {
	const index = useNavigationState(state=>state.index);
	const selectedTheme = useSelector(state=>state.theme);
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

		async function openFile() {
			try {
				const file = decodeURIComponent(route?.params?.file);
				goBack();
				PNFile.openFolder(file);
			} catch(e) {
				console.log(e)
				goBack();
			}
		}
		if(type==='open_file') openFile();
		else goBack();

    },[route])

	return (
		<Layout navigation={navigation} title="Portalnesia" withBack>
			<Loading />
		</Layout>
	);
}
