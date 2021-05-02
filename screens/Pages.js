import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,Divider,useTheme,Spinner} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'
import analytics from '@react-native-firebase/analytics'
import i18n from 'i18n-js'
import usePost from '@pn/utils/API'

import Layout from '@pn/components/global/Layout';
//import Image from '@pn/components/global/Image';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {Parser} from '@pn/components/global/Parser'
import {ucwords} from '@pn/utils/Main'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import {CONTENT_URL} from '@env'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'

//const ShareIcon=(props)=><Icon {...props} name="ios-share" pack="material" />

export default function({navigation,route}){
    const {slug,navbar} = route.params
    const [open,setOpen]=React.useState(false)
    const {data,error,mutate,isValidating}=useSWR(`/pages/${slug}`,{},false)
    const theme = useTheme()
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:0}	
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub
    const {PNget} = usePost();

    React.useEffect(()=>{
        let timeout = null;
        async function check() {
            await analytics().logSelectContent({
                content_type:'user',
                item_id:String(data?.users?.id)
            })
            await PNget(`/pages/${slug}/update`);
            setReady(true)
        }

        if(data && !data?.error && !ready && !__DEV__) {
            timeout = setTimeout(check,5000);
        }

        if(!data) {
            mutate();
        }
        
        return ()=>{
            if(ready) setReady(false)
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready,route])

    return (
        <>
            <Layout navigation={navigation} custom={
                <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
                    <Header title={navbar||"Pages"} withBack navigation={navigation} height={56} menu={()=> <MenuToggle onPress={()=>{setOpen(true)}} />} />
                </Animated.View>
            }>
                
                {!data && !error ? (
                    <View style={{height:'100%',paddingTop:heightHeader+8}}>
                        <Skeleton type="article" />
                    </View>
                ) : error || data?.error ? (
                    <NotFound status={data?.code||503}><Text>{data?.msg||"Something went wrong"}</Text></NotFound>
                ) : data?.pages?.text ? (
                    <Animated.ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingTop:heightHeader+8
                        }}
                        {...other}
                        {...((!data && !error) || (!isValidating && (!error || data?.error==0)) ? {refreshControl: <RefreshControl colors={['white']} progressBackgroundColor="#2f6f4e" progressViewOffset={heightHeader} refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}
                    >
                    <Lay style={[style.container,{paddingVertical:20}]}>
                        <Text category="h2" style={{paddingVertical:10}}>{data?.pages?.title}</Text>
                        <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text style={{fontSize:13}}>{`Last modified ${data?.pages?.date}`}</Text>
                            <Text style={{fontSize:13}}>{`${data?.pages?.seen?.format} views`}</Text>
                        </Lay>
                        <Lay style={{paddingBottom:5,flexDirection:'row'}}>
                            <Text style={{fontSize:13}}>By </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}}>{"Portalnesia"}</Text>
                        </Lay>
                    </Lay>
                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                    <Lay style={{paddingBottom:50}}><Parser source={data?.pages?.text} selectable /></Lay>
                    </Animated.ScrollView>
                ) : null}
            </Layout>
            {data && data?.error==0 && ready && (
                 <MenuContainer
                    visible={open}
                    handleOpen={()=>setOpen(true)}
                    handleClose={()=>setOpen(false)}
                    onClose={()=>setOpen(false)}
                    type="pages"
                    item_id={data?.pages?.id}
                    share={{
                        link:`/pages/${data?.pages?.slug}?utm_campaign=pages`,
                        title:`${data?.pages?.title} - Portalnesia`
                    }}
                    menu={[{
                        action:"share",
                        title:i18n.t('share'),
                    },{
                        title:i18n.t('copy_link'),
                        action:'copy'
                    },{
                        title:i18n.t('open_in_browser'),
                        action:'browser'
                    }]}
                />
            )}
        </>
    )
}