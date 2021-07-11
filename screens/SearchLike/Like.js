import React from 'react'
import { View,Dimensions,FlatList,RefreshControl} from 'react-native';
import {Layout as Lay,Text,Card,useTheme,Divider} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'
import Image from '@pn/module/FastImage'
import {linkTo} from '@pn/navigation/useRootNavigation'

import Layout from '@pn/components/global/Layout';
import Skeleton from '@pn/components/global/Skeleton'
import {AuthContext} from '@pn/provider/Context'
import useSWR from '@pn/utils/swr';
import NotFound from '@pn/components/global/NotFound'
import {ucwords,specialHTML} from '@pn/utils/Main'
import Button from '@pn/components/global/Button';
import NotFoundScreen from '../NotFound'
import i18n from 'i18n-js';

const {width:winWidth,height:winHeight} = Dimensions.get('window')

export const RenderWithImage=React.memo(({data,item,index,theme,linkTo,navigation,withType=true})=>{
    if(!withType) {
        const angka = index % 2;
        const cardSize=(winWidth/2)-7
        return (
            <React.Fragment key={`fragment-${index}`}>
                {angka === 0 && (
                    <View key={`view-${index}`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Card  key={`view-${index}-0`} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(item?.link)} header={(props)=>(
                            <View {...props} style={{...props?.style,padding:0}}>
                                <Image
                                    style={{
                                        height:cardSize,
                                        width:cardSize
                                    }}
                                    source={{uri:item.image}}
                                />
                            </View>
                        )}>
                            <Text category="p1">{item.title}</Text>
                        </Card>
                        {data?.[index+1]?.title && (
                            <Card  key={`view-${index}-1`} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>linkTo(data?.[index+1]?.link)} header={(props)=>(
                                <View {...props} style={{...props?.style,padding:0}}>
                                    <Image
                                        style={{
                                            height:cardSize,
                                            width:cardSize
                                        }}
                                        source={{uri:data?.[index+1]?.image}}
                                    />
                                </View>
                            )}>
                                <Text category="p1">{specialHTML(data?.[index+1]?.title)}</Text>
                            </Card>
                        )}
                    </View>
                )}
            </React.Fragment>
        )
    }
    if(item?.data?.length > 0) {
        return (
            <View key={`${item?.type}-${index}`} style={{marginVertical:10,marginBottom:50}}>
                <View key={`text-render-${index}`} style={{margin:5,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flexGrow:1,marginRight:10,flexShrink:1}}><Text style={{margin:5,fontSize:18,fontFamily:"Inter_SemiBold"}}>{ucwords(item.type)}</Text></View>
                    {item?.data?.length >= 6 && <Button appearance="ghost" status="basic" onPress={()=>navigation?.navigate("LikeFilter",{filter:item?.type})}>See more</Button>}
                </View>
                <Divider key={`divider-render-${index}`} style={{backgroundColor:theme['border-text-color'],marginBottom:5}} />
                {item?.data?.map((dt,i)=>{
                    const angka = i % 2;
                    const cardSize=(winWidth/2)-7
                    return (
                        <React.Fragment key={`fragment-${index}-${i}`}>
                            {angka === 0 && (
                                <View key={`view-${index}-${i}`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                    <Card  key={`view-${index}-${i}-0`} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(dt?.link)} header={(props)=>(
                                        <View {...props} style={{...props?.style,padding:0}}>
                                            <Image
                                                style={{
                                                    height:cardSize,
                                                    width:cardSize
                                                }}
                                                source={{uri:dt.image}}
                                            />
                                        </View>
                                    )}>
                                        <Text category="p1">{dt.title}</Text>
                                    </Card>
                                    {item?.data?.[i+1]?.title && (
                                        <Card  key={`view-${index}-${i}-1`} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>linkTo(item?.data?.[i+1]?.link)} header={(props)=>(
                                            <View {...props} style={{...props?.style,padding:0}}>
                                                <Image
                                                    style={{
                                                        height:cardSize,
                                                        width:cardSize
                                                    }}
                                                    source={{uri:item?.data?.[i+1]?.image}}
                                                />
                                            </View>
                                        )}>
                                            <Text category="p1">{specialHTML(item?.data?.[i+1]?.title)}</Text>
                                        </Card>
                                    )}
                                </View>
                            )}
                        </React.Fragment>
                    )
                })}
            </View>
        )
    }
})

export const RenderNoImage=React.memo(({data,item,index,theme,linkTo,navigation,withType=true})=>{
    if(!withType) {
        const angka = index % 2;
        const cardSize=(winWidth/2)-7
        return (
            <React.Fragment key={`fragment-${index}`}>
                {angka === 0 ? (
                    <View key={`view-${index}`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Card  key={`view-${index}-0`} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(item?.link)}>
                            <Text category="p1" style={{marginBottom:5}}>{item.title}</Text>
                            <Text category="label">{specialHTML(item.text)}</Text>
                        </Card>
                        {data?.[index+1]?.title && (
                            <Card  key={`view-${index}-1`} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>linkTo(data?.[index+1]?.link)}>
                                <Text category="p1" style={{marginBottom:5}}>{data?.[index+1]?.title}</Text>
                                <Text category="label">{specialHTML(data?.[index+1]?.text)}</Text>
                            </Card>
                        )}
                    </View>
                ) : null}
            </React.Fragment>
        )
    }
    if(item?.data?.length > 0) {
        return (
            <View key={`${item?.type}-${index}`} style={{marginVertical:10}}>
                <View key={`text-render-${index}`} style={{margin:5,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flexGrow:1,marginRight:10,flexShrink:1}}><Text style={{margin:5,fontSize:18,fontFamily:"Inter_SemiBold"}}>{ucwords(item.type)}</Text></View>
                    {item?.data?.length >= 6 && <Button appearance="ghost" status="basic" onPress={()=>navigation?.navigate("LikeFilter",{filter:item?.type})}>See more</Button>}
                </View>
                <Divider key={`divider-render-${index}`} style={{backgroundColor:theme['border-text-color'],marginBottom:5}} />
                {item?.data?.map((dt,i)=>{
                    const angka = i % 2;
                    const cardSize=(winWidth/2)-7
                    return (
                        <React.Fragment key={`fragment-${index}-${i}`}>
                            {angka === 0 && (
                                <View key={`view-${index}-${i}`} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                    <Card  key={`view-${index}-${i}-0`} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(dt?.link)}>
                                        <Text category="p1" style={{marginBottom:5}}>{dt.title}</Text>
                                        <Text category="label">{specialHTML(dt.text)}</Text>
                                    </Card>
                                    {item?.data?.[i+1]?.title && (
                                        <Card  key={`view-${index}-${i}-1`} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>linkTo(item?.data?.[i+1]?.link)}>
                                            <Text category="p1" style={{marginBottom:5}}>{item?.data?.[i+1]?.title}</Text>
                                            <Text category="label">{specialHTML(item?.data?.[i+1]?.text)}</Text>
                                        </Card>
                                    )}
                                </View>
                            )}
                        </React.Fragment>
                    )
                })}
            </View>
        )
    }
})

export default function Like({navigation,route}){
    const filter = route?.params?.filter;
    const context = React.useContext(AuthContext)
    const {state:{user}}=context;
    if(!user) return <NotFoundScreen navigation={navigation} route={route} />
    const theme = useTheme();
    const {data,error,mutate,isValidating} = useSWR("/like",{},true);
    const [refreshing,setRefreshing] = React.useState(false);

    React.useEffect(()=>{
        if(!isValidating) setRefreshing(false);
    },[isValidating])

    const ref = React.useRef(null)
	useScrollToTop(ref)

    const renderItem=React.useCallback((prop)=>{
        if(['news','blog','users','media','twibbon'].indexOf(prop?.item?.type) !== -1) return <RenderWithImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} navigation={navigation} />
        if(['chord','thread'].indexOf(prop?.item?.type) !== -1) return <RenderNoImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} navigation={navigation} />
        return null;
    },[theme,navigation])

    const RenderEmpty=()=>{
        if(error) {
            return <NotFound status={503}><Text>{i18n.t("errors.general")}</Text></NotFound>
        }
        if(!data && !error) {
            return <Skeleton type="grid" image number={12} />
        }
        return (
            <Lay style={{flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                <Text appearance="hint">No data</Text>
            </Lay>
        )
    }

    React.useEffect(()=>{
        if (filter) return navigation.navigate("LikeFilter",{...route.params})
    },[route])

    React.useEffect(()=>{
        mutate();
    },[])

    return (
        <Layout navigation={navigation} withBack title="Likes">
            <FlatList
                ref={ref}
                data={data ? data?.data : []}
                renderItem={renderItem}
                ListEmptyComponent={RenderEmpty}
                contentContainerStyle={{...(data && data?.data?.length > 0 ? {} : {flex:1})}}
                keyExtractor={(item,index)=>`${item?.type}-${index}`}
                refreshControl={
                    <RefreshControl
                        colors={['white']}
                        progressBackgroundColor="#2f6f4e"
                        onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
                        refreshing={refreshing}
                    />
                }
            />
        </Layout>
    )
}