import React from 'react'
import {ScrollView,RefreshControl,View,Animated} from 'react-native'
import {Layout as Lay, Text,useTheme,Divider,Spinner} from '@ui-kitten/components'
import {openBrowserAsync} from 'expo-web-browser'

import Button from '@pn/components/global/Button';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image';
import NotFound from '@pn/components/global/NotFound'
import useSWR from '@pn/utils/swr'
import style from '@pn/components/global/style'
import {Parser} from '@pn/components/global/Parser'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import {ucwords} from '@pn/utils/Main'
//import {CONTENT_URL} from '@env'

//const MoreIcon=(props)=><Icon {...props} name="more-vertical" />

export default function({navigation,route}){
    const {source,title} = route.params
    const theme=useTheme()
    const {data,error,mutate,isValidating}=useSWR(`/news/${source}/${title}`,{},false)
    const [open,setOpen]=React.useState(false)
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
    },[])

    return (
        <>
        <Layout navigation={navigation} custom={
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title={"News"} subtitle={data?.title||""} withBack navigation={navigation} height={56} menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />} />
			</Animated.View>
        }>
            {!data && !error ? (
                <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Spinner size="giant" /></Lay>
            ) : error || data?.error ? (
                <NotFound {...(data?.error ? {children:<Text>{data?.msg}</Text>} : {})} />
            ) : data?.text ? (
                <Animated.ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop:heightHeader+8
                    }}
                    {...other}
                    {...(!data && !error || (!isValidating && (!error || data?.error==0)) ? {refreshControl: <RefreshControl progressViewOffset={heightHeader} refreshing={isValidating} onRefresh={()=>mutate()} /> } : {})}
                >
                    <Lay style={[style.container]}>
                        <Text category="h2" style={{paddingVertical:10}}>{data?.title}</Text>
                        <Lay style={{paddingTop:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Text style={{fontSize:13}}>{`Last modified ${data?.date_string}`}</Text>
                            <Text style={{fontSize:13}}>{`${data?.seen?.format} views`}</Text>
                        </Lay>
                    </Lay>
                    <Lay style={{paddingVertical:20}}><Divider style={{backgroundColor:theme['border-text-color']}} /></Lay>
                    <Lay style={{paddingBottom:20}}><Parser source={data.text} selectable /></Lay>
                    <Lay>
                        <Lay style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <Button onPress={()=>openBrowserAsync(data?.url)} appearance="ghost" status="basic">Artikel Asli</Button>
                        </Lay>
                    </Lay>
                    <Lay style={{paddingBottom:50}}></Lay>
                </Animated.ScrollView>
            ) : null}
        </Layout>
        {data && ready && (
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

/*
{data?.image?.length > 0 && (
                                <View style={{marginBottom:10}}>
                                    <Image fullSize source={{uri:`${CONTENT_URL}/img/url?image=${encodeURIComponent(data?.image)}&size=400`}} />
                                </View>
                            )}
*/