import React from 'react';
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import {useColorScheme} from 'react-native'
import Portalnesia from '@portalnesia/react-native-core'
import i18n from 'i18n-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'
import { default as theme } from '../theme.json';
import {default as mapping} from '../mapping.json'
import useForceUpdate from '@pn/utils/useFoceUpdate';
import {FontAwesomeIconsPack} from '../components/utils/FontAwesomeIconsPack'
import {IoniconsPack} from '../components/utils/IoniconsPack'
import {MaterialIconsPack} from '../components/utils/MaterialIconsPack'
import BaseNavigator from './BaseNavigator'
import {PortalProvider} from'@gorhom/portal'

function BaseProvider({children}: {children: React.ReactNode}) {
    const [tema,setTema]=React.useState('auto')
    const colorScheme = useColorScheme()
	const forceUpdate = useForceUpdate();
    const [lang,changeLang]=React.useState("auto");

    const selectedTheme = React.useMemo(()=>{
		if(colorScheme==='dark' && tema === 'auto' || tema === 'dark') return 'dark';
		return 'light'
	},[colorScheme,tema])

    React.useEffect(()=>{
        async function asyncTask(){
			try {
				let [res,lang] = await Promise.all([AsyncStorage.getItem("theme"),AsyncStorage.getItem("lang")])

				if(res !== null) setTema(res);
				if(lang !== null) changeLang(lang);

				return Promise.resolve();
			} catch(err){
				console.log("Init Err",err);
				return;
			}
		};

        asyncTask();
    },[])

    React.useEffect(()=>{
		function onLocalizationChange(){
			i18n.translations = {
				en:en_locale,
				id:id_locale
			};
			i18n.fallbacks = true;
			if(['id','en'].indexOf(lang) !== -1) {
				const lng = lang === 'id' ? "id-ID" : "en-US";
				i18n.locale =lng;
			} else {
				i18n.locale = Portalnesia.Core.getLocales()[0].languageTag;
			}
			forceUpdate();
		}

		onLocalizationChange();
		Portalnesia.Core.addEventListener('localizationChange',onLocalizationChange)

		return ()=>{
			Portalnesia.Core.removeEventListener('localizationChange',onLocalizationChange)
		}
	},[lang])

    return (
        <React.Fragment>
            <IconRegistry icons={[EvaIconsPack,FontAwesomeIconsPack,IoniconsPack,MaterialIconsPack]} />
            <ApplicationProvider {...eva} theme={{...eva[selectedTheme],...theme[selectedTheme]}} customMapping={mapping as any}>
                <BaseNavigator tema={tema} selectedTheme={selectedTheme} lang={lang}>
					<PortalProvider>
						{children}
					</PortalProvider>
				</BaseNavigator>
            </ApplicationProvider>
        </React.Fragment>
    )
}
export default React.memo(BaseProvider);