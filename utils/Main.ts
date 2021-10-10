import {Alert} from 'react-native'
import {openBrowserAsync} from 'expo-web-browser'
import i18n from 'i18n-js'

export const openBrowser=(url: string,alert=true)=>{
    if(alert) {
        Alert.alert(
            i18n.t('title_external_link'),
            i18n.t('desc_external_link'),
            [{
                text:i18n.t('cancel'),
                onPress:()=>{}
            },{
                text:i18n.t("open"),
                onPress:()=>{
                        openBrowserAsync(url,{
                        enableDefaultShareMenuItem:true,
                        toolbarColor:'#2f6f4e',
                        showTitle:true
                    })
                }
            }]
        )
    } else {
        openBrowserAsync(url,{
            enableDefaultShareMenuItem:true,
            toolbarColor:'#2f6f4e',
            showTitle:true
        })
    }
    
}