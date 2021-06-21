import React from 'react'
import {useWindowDimensions,View,Share} from 'react-native'
import {Icon,Layout,Text,useTheme,Menu,MenuItem} from '@ui-kitten/components'
import {Modalize} from 'react-native-modalize'
import analytics from '@react-native-firebase/analytics'

import TopNavigationAction from '../navigation/TopAction'
import {URL,LINK_URL} from '@env'
import { AuthContext } from '@pn/provider/Context';
import useClipboard from '@pn/utils/clipboard'
import {openBrowser} from '@pn/utils/Main'
import i18n from 'i18n-js'
import useAPI from '@pn/utils/API'
import {Portal} from '@gorhom/portal'

const MoreIcon=(props?: {style: Record<string,any>})=><Icon {...props} name="more-vertical" />
const FeedbackIcon=(props?: {style: Record<string,any>})=><Icon {...props} name="feedback" pack="material" />

export type FeedbackToggleProps = {
    link?: string
}
export const FeedbackToggle=React.memo(({link}: FeedbackToggleProps)=>{
    const context = React.useContext(AuthContext)
    const {sendReport}=context;

    const onPress=React.useCallback(()=>{
        if(link) sendReport('feedback',{urlreported:`${URL}${link}`})
        else sendReport('feedback')
    },[link])

    return <TopNavigationAction tooltip={i18n.t('feedback')} icon={FeedbackIcon} onPress={onPress} />
})

export type MenuToggleProps = {
    onPress:()=>void,
    tooltip?: string
}
export const MenuToggle=React.memo(({onPress,tooltip}: MenuToggleProps)=><TopNavigationAction tooltip={tooltip||i18n.t('more_option')} icon={MoreIcon} onPress={onPress} />)

export type MenuType = {
    title: string,
    onPress?:()=>void,
    action?:string,
    beforeAction?:()=>void
}
export type ShareType = {
    link: string,
    dialog?: string,
    title?: string,
    fullUrl?:boolean
}

export interface MenuContainerProps {
    menu:MenuType[],
    visible:boolean,
    onClose?:()=>void,
    onClosed?:()=>void,
    share?:ShareType,
    type?: string,
    item_id?: string|number
}
const MenuCont=({menu,visible,onClose,onClosed,share,type,item_id}: MenuContainerProps)=>{
    const context = React.useContext(AuthContext)
    const {sendReport} = context
    const {copyText} = useClipboard()
    const {PNpost} = useAPI();
    const [selectedMenu,setSelectedMenu]=React.useState<MenuType|null>(null)
    //const {width}=useWindowDimensions()
    const theme=useTheme()
    const ref = React.useRef<Modalize>();
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

    const handleShare=async(text?: string,url?: string,dialog?: string)=>{
        Share.share({
            message:text ? `${text} ${url}` : url,
            url:url||''
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
    }

    const handleOnPress=(dt: MenuType)=>{
        setSelectedMenu(dt);
    }

    React.useEffect(()=>{
        if(selectedMenu !== null) {
            setTimeout(()=>ref?.current?.close());
        }
    },[selectedMenu])

    const onModalClosed=()=>{
        if(selectedMenu !== null) {
            if(selectedMenu?.beforeAction) selectedMenu?.beforeAction();
            if(selectedMenu?.onPress) selectedMenu?.onPress();
            else if(share) {
                if(selectedMenu?.action === "share") {
                    handleShare(share?.title,`${share?.fullUrl ? share?.link : `${URL}${share?.link}`}&utm_source=android&utm_medium=share`,share?.dialog);
                } else if(selectedMenu?.action === "copy") {
                    copyText(`${share?.fullUrl ? share?.link : `${URL}${share?.link}`}&utm_source=android&utm_medium=copy+link`,i18n.t('url'));
                } else if(selectedMenu?.action === 'browser') {
                    openBrowser(`${share?.fullUrl ? share?.link : `${LINK_URL}${share?.link}`}&utm_source=android&utm_medium=browser`,false);
                } else if(selectedMenu?.action === 'report') {
                    setTimeout(()=>sendReport('konten',{contentType:type,contentTitle:share?.title,contentId:item_id,...(share?.link ? {urlreported:`${URL}${share?.link}`} : {} )}))
                } else if(selectedMenu?.action === 'feedback') {
                    setTimeout(()=>sendReport('feedback',{...(share?.link ? {urlreported:`${URL}${share?.link}`} : {} )}))
                }
            }
            setSelectedMenu(null)
        }
        if(onClosed) onClosed();
    }

    return (
        <Portal>
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
                    <Layout style={{marginBottom:15,paddingTop:10}}>
                        <Menu appearance="noDivider">
                            {menu?.map((dt,i)=>{
                                return <MenuItem style={{paddingHorizontal:15,paddingVertical:12}} key={`${i}`} title={()=><Text>{dt.title||""}</Text>} onPress={()=>handleOnPress(dt)} />
                                
                            })}
                        </Menu>
                    </Layout>
                </Layout>
            </Modalize>
        </Portal>
    )
}
export const MenuContainer = React.memo(MenuCont)