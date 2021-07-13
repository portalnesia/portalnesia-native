import React from 'react'
import {View,Share,ImageProps,ColorValue} from 'react-native'
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
import {sentLike} from '@pn/components/global/Like'
import Spinner from './Spinner'
import useSelector from '@pn/provider/actions'

const MoreIcon=(props?: Partial<ImageProps>)=><Icon {...props} name="more-vertical" />
const FeedbackIcon=(props?: Partial<ImageProps>)=><Icon {...props} name="feedback" pack="material" />
const FeedbackMenuIcon=(props?: Partial<ImageProps>)=><View style={{marginRight:15}}><Icon {...props} name="feedback" pack="material" /></View>
const ShareIcon=(props?: Partial<ImageProps>)=><Icon {...props} style={[props?.style,{marginHorizontal:0,marginRight:15}]} name="share" />
const BrowserIcon=(props?: Partial<ImageProps>)=><Icon {...props} style={[props?.style,{marginHorizontal:0,marginRight:15}]} name="browser" />
const LinkIcon=(props?: Partial<ImageProps>)=><Icon {...props} style={[props?.style,{marginHorizontal:0,marginRight:15}]} name="link-2" />
const LikeIcon=(value: boolean)=>(props?: Partial<ImageProps>)=>{
    const theme = useTheme();
    const name = value ? "heart" : "heart-outline";
    return <Icon {...props} style={[props?.style,{marginHorizontal:0,marginRight:15,tintColor:theme['color-danger-500']}]} name={name} />
}
const CustomIcon=(prop: {name:string,pack?:string}|string,color?:ColorValue)=>(props?: Partial<ImageProps>)=>{
    const name = typeof prop === 'string' ? prop : prop?.name;
    const pack = typeof prop === 'object' && prop?.pack ? prop?.pack : undefined;
    if(pack) {
        return (
            <View style={{marginRight:15}}>
                <Icon {...props} style={[props?.style,{...(color ? {tintColor:color} : {})}]} name={name} pack={pack} />
            </View>
        )
    }
    return <Icon {...props} style={[props?.style,{marginHorizontal:0,marginRight:15,...(color ? {tintColor:color} : {})}]} name={name} />
}
const LoadingComp=()=> <Spinner style={{marginLeft:5}} />

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

type LikeMenuType = {
    value: boolean,
    onSuccess?(result: boolean): void
}

export type MenuType = {
    title: string,
    onPress?:()=>void,
    action?:string,
    beforeAction?:()=>void,
    icon?:{name:string,pack?:string}|string,
    color?:ColorValue,
    like?:LikeMenuType
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

function getIcon(action?: string,value?: any) {
    if(action === 'share') return ShareIcon;
    if(action === 'feedback' || action === 'report') return FeedbackMenuIcon;
    if(action === 'copy') return LinkIcon;
    if(action === 'browser') return BrowserIcon;
    if(action === 'like') return LikeIcon(value??false);
    return undefined;
}

const MenuCont=({menu,visible,onClose,onClosed,share,type,item_id}: MenuContainerProps)=>{
    const context = React.useContext(AuthContext)
    const {sendReport,setNotif} = context
    const user = useSelector(state=>state.user)
    const {copyText} = useClipboard()
    const {PNpost} = useAPI();
    const [selectedMenu,setSelectedMenu]=React.useState<MenuType|null>(null)
    const [loading,setLoading] = React.useState(false);
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

    const handleShare=React.useCallback(async(text?: string,url?: string,dialog?: string)=>{
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
    },[type,item_id,PNpost])

    const handleLike=React.useCallback(async(like: LikeMenuType)=>{
        if(!user) return setNotif(true,"Error","Login to continue!");
        setLoading(true)
        try {
            const res = await sentLike(PNpost,type,item_id);
            if(typeof res?.liked !== 'undefined') {
                if(like.onSuccess) like.onSuccess(res.liked);
                setNotif(false,"Success");
            }
        } catch(e){
            
        } finally {
            setLoading(false);
        }
    },[type,item_id,PNpost,user])

    const handleOnPress=React.useCallback((dt: MenuType)=>{
        setSelectedMenu(dt);
    },[])

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
                } else if(selectedMenu?.action === 'like' && typeof selectedMenu?.like !== 'undefined') {
                    handleLike(selectedMenu?.like)
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
                                const disabled = dt?.action==='like' && loading;
                                const accessRight = (dt?.action==='like' && loading) ? LoadingComp : undefined;
                                const color = dt?.color;
                                const icon = dt?.icon ? CustomIcon(dt?.icon,color) : getIcon(dt?.action,(dt?.action==='like' ? dt?.like?.value : undefined));
                                return <MenuItem disabled={disabled} accessoryLeft={icon} accessoryRight={accessRight} style={{paddingHorizontal:15,paddingVertical:12,justifyContent:'flex-start'}} key={`${i}`} title={()=><Text>{dt.title||""}</Text>} onPress={()=>handleOnPress(dt)} />
                            })}
                        </Menu>
                    </Layout>
                </Layout>
            </Modalize>
        </Portal>
    )
}
export const MenuContainer = React.memo(MenuCont)