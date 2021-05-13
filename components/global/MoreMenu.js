import React from 'react'
import {useWindowDimensions,View,Share} from 'react-native'
import {Icon,Layout,Text,useTheme,Menu,MenuItem} from '@ui-kitten/components'
import {Modalize} from 'react-native-modalize'
import analytics from '@react-native-firebase/analytics'

import TopNavigationAction from '../navigation/TopAction'
import {URL} from '@env'
import { AuthContext } from '@pn/provider/Context';
import useClipboard from '@pn/utils/clipboard'
import {openBrowser} from '@pn/utils/Main'
import i18n from 'i18n-js'
import useAPI from '@pn/utils/API'

const MoreIcon=(props)=><Icon {...props} name="more-vertical" />
const FeedbackIcon=(props)=><Icon {...props} name="feedback" pack="material" />

export const FeedbackToggle=React.memo(()=>{
    const context = React.useContext(AuthContext)
    const {sendReport}=context;
    return <TopNavigationAction tooltip={i18n.t('feedback')} icon={FeedbackIcon} onPress={()=>sendReport('feedback')} />
})
export const MenuToggle=React.memo(({onPress})=><TopNavigationAction tooltip={i18n.t('more_option')} icon={MoreIcon} onPress={onPress} />)

const MenuCont=({menu,visible,onClose,onClosed,share,type,item_id,...props})=>{
    const context = React.useContext(AuthContext)
    const {setNotif,sendReport} = context
    const {copyText} = useClipboard()
    const {PNpost} = useAPI();
    const [selectedMenu,setSelectedMenu]=React.useState(null)
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
        if(type && item_id && !__DEV__) {
            try {
                await Promise.all([
                    analytics().logShare({
                        content_type:type,
                        item_id:String(item_id),
                        method:"share_button"
                    }),
                    PNpost(`/backend/shared?native=true`,{type,posid:item_id})
                ])
            } catch(e) {}
        }
    },[type,item_id])

    const handleOnPress=(dt)=>{
        setSelectedMenu(dt);
    }

    React.useEffect(()=>{
        if(selectedMenu !== null) {
            ref?.current?.close();
        }
    },[selectedMenu])

    const onModalClosed=()=>{
        if(selectedMenu !== null) {
            if(selectedMenu?.beforeAction) selectedMenu?.beforeAction();
            if(selectedMenu?.onPress) selectedMenu?.onPress();
            else if(share) {
                if(selectedMenu?.action === "share") {
                    handleShare(share?.title,`${URL}${share?.link}&utm_source=android&utm_medium=share`,share?.dialog);
                } else if(selectedMenu?.action === "copy") {
                    copyText(`${URL}${share?.link}&utm_source=android&utm_medium=copy+link`,i18n.t('url'));
                } else if(selectedMenu?.action === 'browser') {
                    openBrowser(`${URL}${share?.link}&utm_source=android&utm_medium=browser`,false);
                } else if(selectedMenu?.action === 'report') {
                    setTimeout(()=>sendReport('konten',{contentType:type,contentTitle:share?.title,contentId:item_id,urlreported:`${URL}${share?.link}`}))
                } else if(selectedMenu?.action === 'feedback') {
                    setTimeout(()=>sendReport('feedback',{urlreported:`${URL}${share?.link}`}))
                }
            }
            setSelectedMenu(null)
        }
        if(onClosed) onClosed();
    }

    return (
        <Modalize
            ref={ref}
            withHandle={false}
            modalStyle={{
                backgroundColor:theme['background-basic-color-1'],
            }}
            onClose={onClose}
            adjustToContentHeight
            onClosed={onModalClosed}
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