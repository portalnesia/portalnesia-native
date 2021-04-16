import React from 'react'
import {useWindowDimensions,View,Share} from 'react-native'
import {Icon,Layout,Text,useTheme,Menu,MenuItem} from '@ui-kitten/components'
import {Modalize} from 'react-native-modalize'
import {openBrowserAsync} from 'expo-web-browser'
import analytics from '@react-native-firebase/analytics'

import TopNavigationAction from '../navigation/TopAction'
import {URL} from '@env'
import { AuthContext } from '@pn/provider/AuthProvider';
import useClipboard from '@pn/utils/clipboard'
import i18n from 'i18n-js'

const MoreIcon=(props)=><Icon {...props} name="more-vertical" />

export const MenuToggle=({onPress})=><TopNavigationAction icon={MoreIcon} onPress={onPress} />

const MenuCont=({menu,visible,onClose,share,type,item_id,...props})=>{
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const {copyText} = useClipboard()
    //const {width}=useWindowDimensions()
    const theme=useTheme()
    const ref = React.useRef(null)
    const Header = (
        <View style={{alignItems:'center',justifyContent:'center',padding:9}}>
            <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
        </View>
    )

    React.useEffect(()=>{
        if(visible) {
            ref?.current?.open();
        }
    },[visible])

    const handleShare=React.useCallback(async(text,url,dialog)=>{
        Share.share({
            message:`${text} ${url}`,
            url:url
        },{
            dialogTitle:dialog||i18n.t('share')
        })
        if(type && item_id) {
            await analytics().logShare({
                content_type:type,
                item_id:String(item_id),
                method:"share_button"
            })
        }
    },[type,item_id])

    const handleOnPress=(dt)=>{
        if(dt?.onPress) dt?.onPress();
        else if(share) {
            if(dt?.action === "share") {
                handleShare(share?.title,`${URL}${share?.link}&utm_source=android&utm_medium=share`,share?.dialog);
            } else if(dt?.action === "copy") {
                copyText(`${URL}${share?.link}&utm_source=android&utm_medium=copy+link`,i18n.t('url'));
            } else if(dt?.action === 'browser') {
                openBrowserAsync(`${URL}${share?.link}&utm_source=android&utm_medium=browser`,{
                    enableDefaultShare:true,
                    toolbarColor:'#2f6f4e',
                    showTitle:true
                });
            }
        }
        ref?.current?.close();
    }

    return (
        <Modalize
            ref={ref}
            withHandle={false}
            onClose={onClose}
            modalStyle={{
                backgroundColor:theme['background-basic-color-1'],
            }}
            adjustToContentHeight
        >
            <Layout style={{borderTopLeftRadius:20,
                borderTopRightRadius:20}}>
                {Header}
                <Layout style={{marginBottom:10}}>
                    <Menu appearance="noDivider">
                        {menu?.map((dt,i)=>{
                            return <MenuItem style={{paddingHorizontal:12,paddingVertical:12}} key={`${i}`} title={dt.title||""} onPress={()=>handleOnPress(dt)} />
                            
                        })}
                    </Menu>
                </Layout>
            </Layout>
        </Modalize>
    )
}
export const MenuContainer = React.memo(MenuCont)

/*
    <BackDr
            visible={visible||false}
            header={Header}
            containerStyle={{
                backgroundColor:theme['background-basic-color-1'],
                borderTopLeftRadius:20,
                borderTopRightRadius:20,
            }}
            overlayColor="rgba(0, 0, 0, 0.52)"
            {...props}
        >
            <Layout>
                <Layout style={{marginBottom:10}}>
                    <Menu appearance="noDivider">
                        {menu?.map((dt,i)=>{
                            const onPress=dt?.onPress
                            return <MenuItem style={{paddingHorizontal:12,paddingVertical:12}} key={`${i}`} title={dt.title} onPress={onPress} />
                            
                        })}
                    </Menu>
                </Layout>
            </Layout>
        </BackDr>
*/