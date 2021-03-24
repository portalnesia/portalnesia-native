import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,Spinner,Divider,useTheme} from '@ui-kitten/components'

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
    const {slug} = route.params
    const [open,setOpen]=React.useState(false)
    const {data,error,mutate,isValidating}=useSWR(`/blog/${slug}`,{},false)
    const theme = useTheme()
    const [ready,setReady]=React.useState(false)
    const heightt = {...headerHeight,sub:0}	
    const {translateY,...other} = useHeader()
	const heightHeader = heightt?.main + heightt?.sub

    React.useEffect(()=>{
        let timeout=null;
        if(!ready) {
            timeout = setTimeout(()=>{
                setReady(true)
            },500)
        }
        return ()=>{
            if(timeout !== null) clearTimeout(timeout);
        }
    },[data,ready])

    React.useEffect(()=>{
        return ()=>setReady(false)
    },[route])

    return (
        <>
        <Layout navigation={navigation} custom={
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title='Blog' subtitle={data?.blog?.title||""} withBack navigation={navigation} height={56} menu={()=> <MenuToggle onPress={()=>{setOpen(true)}} />} />
			</Animated.View>
        }>
            {!data && !error ? (
                <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Spinner size="giant" /></Lay>
            ) : error || data?.error ? (
                <NotFound {...(data?.error ? {children:<Text>{data?.msg}</Text>} : {})} />
            ) : data?.blog?.text ? (
                <Animated.ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader+8
                    }}
                    {...other}
                    {...((!data && !error) || (!isValidating && (!error || data?.error==0)) ? {refreshControl: <RefreshControl progressViewOffset={heightHeader} refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}
                >
                    <Lay style={[style.container,{paddingVertical:20}]}>
                        <Text category="h2" style={{paddingVertical:10}}>{data?.blog?.title}</Text>
                        <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text style={{fontSize:13}}>{`Last modified ${data?.blog?.date}`}</Text>
                            <Text style={{fontSize:13}}>{`${data?.blog?.seen?.format} views`}</Text>
                        </Lay>
                        <Lay style={{paddingBottom:5,flexDirection:'row'}}>
                            <Text style={{fontSize:13}}>By </Text><Text status="info" style={{fontSize:13,textDecorationLine:"underline"}}>{data?.blog?.users?.name||"Portalnesia"}</Text>
                        </Lay>
                    </Lay>
                    <Divider style={{backgroundColor:theme['border-text-color']}} />
                    <Lay style={{paddingBottom:50}}><Parser source={data?.blog?.text} selectable /></Lay>
                </Animated.ScrollView>
            ) : null}
        </Layout>
        {data && data?.error==0 && ready && (
            <MenuContainer
               visible={open}
               handleOpen={()=>setOpen(true)}
               handleClose={()=>setOpen(false)}
               onClose={()=>setOpen(false)}
               menu={[{
                   title:"Share",
               },{
                   title:"Copy Link"
               }]}
           />
       )}
        </>
    )
}