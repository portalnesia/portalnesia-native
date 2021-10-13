import React from 'react'
import { View,Dimensions,FlatList,ScrollView,Animated} from 'react-native';
import {Layout as Lay,Text,Card,useTheme,Input, Icon,Divider} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'
import Image from '@pn/module/FastImage'
import {linkTo} from '@pn/navigation/useRootNavigation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import analytics from '@react-native-firebase/analytics'

import Layout from '@pn/components/global/Layout';
import Skeleton from '@pn/components/global/Skeleton'
import Pressable from '@pn/components/global/Pressable'
import useAPI from '@pn/utils/API';
import NotFound from '@pn/components/global/NotFound'
import {ucwords,specialHTML} from '@portalnesia/utils'
import Button from '@pn/components/global/Button';
import ListItem from '@pn/components/global/ListItem';
import i18n from 'i18n-js';

const arrayMove = require('array-move')
const AnimLay = Animated.createAnimatedComponent(Lay);
const CloseIcon=(props)=>{
    return <Icon {...props} name="close-circle-outline" style={{...props?.style,marginHorizontal:0,width:24,height:24}} />
}

const DeleteIcon=(props) => <Icon {...props} name="close" style={{...props?.style,marginHorizontal:0,width:24,height:24}} />

const {width:winWidth,height:winHeight} = Dimensions.get('window')

export const RenderWithImage=React.memo(({data,item,index,theme,linkTo,navigation,q,withType=true})=>{
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
                    {item?.data?.length >= 6 && <Button appearance="ghost" status="basic" onPress={()=>navigation?.navigate("SearchFilter",{q,filter:item?.type})}>See more</Button>}
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

export const RenderNoImage=React.memo(({data,item,index,theme,linkTo,navigation,q,withType=true})=>{
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
                    {item?.data?.length >= 6 && <Button appearance="ghost" status="basic" onPress={()=>navigation?.navigate("SearchFilter",{q,filter:item?.type})}>See more</Button>}
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

export default function Search({navigation,route}){
    const q = route?.params?.q;
    const filter = route?.params?.filter;
    const {PNget}=useAPI();
    const theme = useTheme();
    const [search,setSearch] = React.useState(q ? decodeURIComponent(q) : "");
    const [data,setData]=React.useState([]);
    const [loading,setLoading]=React.useState(false);
    const [error,setError]=React.useState(false);
    const [isEmpty,setEmpty]=React.useState(false);
    //const [focus,setFocus]=React.useState(false);
    const [history,setHistory]=React.useState([])
    const inputRef=React.useRef(null)

    const ref = React.useRef(null)
	useScrollToTop(ref)

    const saveHistory=async(text)=>{
        const his = [...history];
        const index=his.findIndex((it)=>it.toLowerCase() === text.toLowerCase() );
        try {
            if(index === -1) {
                his.unshift(text);
                if(his.length > 8) his.splice(9,1)
                setHistory(his)
                await AsyncStorage.setItem("search_history",JSON.stringify(his));
            } else {
                arrayMove.mutate(his,index,0);
                setHistory(his)
                await AsyncStorage.setItem("search_history",JSON.stringify(his));
            }
        } catch(err) {
            console.log("ERROR");
        }
    }

    const getData=(se)=>{
        setError(false);
        setEmpty(false)
        setData([])
        const text = se||search
        if(text?.match(/\S/) !== null) {
            setLoading(true)
            Promise.all([
                PNget(`/search?q=${encodeURIComponent(text)}`),
                saveHistory(text),
                analytics().logSearch({search_term:text})
            ])
            .then((result)=>{
                const res = result[0];
                if(!Boolean(res?.error)) {
                    //console.log(res?.data?.[2]?.data);
                    if(res?.data?.length === 0) setEmpty(true)
                    setData(res?.data)
                } else {
                    setError(true)
                }
            })
            .catch((e)=>setError(true))
            .finally(()=>{
                setLoading(false)
            })
        }
    }

    const onSelect=index=>{
        setSearch(history[index]);
        getData(history[index])
        inputRef?.current?.blur();
    }

    const onRemoveSearch=()=>{
        setSearch("")
        setError(false);
        setEmpty(false)
        setData([])
    }

    const deleteHistory=async(i)=>{
        const his = [...history]
        his.splice(i,1)
        setHistory(his)
        await AsyncStorage.setItem("search_history",JSON.stringify(his));
    }

    const renderItem=(prop)=>{
        if(['news','blog','users','media','twibbon'].indexOf(prop?.item?.type) !== -1) return <RenderWithImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} navigation={navigation} q={encodeURIComponent(search)} />
        if(['chord','thread'].indexOf(prop?.item?.type) !== -1) return <RenderNoImage key={`${prop?.item?.type}-${prop?.index}`} {...prop} theme={theme} linkTo={linkTo} navigation={navigation} q={encodeURIComponent(search)} />
        return null;
    }

    const RenderEmpty=()=>{
        if(error) {
            return <NotFound status={503}><Text>{i18n.t("errors.general")}</Text></NotFound>
        }
        if(loading) {
            return <Skeleton type="grid" image number={12} />
        }
        if(history?.length > 0) {
            return (
                <ScrollView
                    contentContainerStyle={{paddingVertical:15}}
                >
                    <Text appearance="hint" style={{fontSize:13,paddingHorizontal:15,marginBottom:5}}>Recent</Text>
                    {history?.map((dt,i)=>(
                        <ListItem rootStyle={{paddingVertical:7}} onPress={()=>onSelect(i)} key={i} title={()=><Text category="h6" style={{marginLeft:8}}>{dt}</Text>} accessoryRight={DeleteButton(i)} style={{paddingRight:10}} />
                    ))}
                </ScrollView>
            ) 
        }
        return (
            <Lay style={{flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                <Text appearance="hint">{isEmpty ? "No data" : "Search..."}</Text>
            </Lay>
        )
    }

    const CloseButton=(props)=>{
        if(search?.match(/\S+/) !== null) {
            return (
                <View style={{borderRadius:22,overflow:'hidden'}}>
                    <Pressable onPress={onRemoveSearch}><CloseIcon {...props} /></Pressable>
                </View>
            )
        }
        return null;
    }
    
    const DeleteButton=(i)=>(props)=>(
        <View style={{borderRadius:22,overflow:'hidden'}}>
            <Pressable onPress={()=>deleteHistory(i)} style={{padding:5}} tooltip={i18n.t("remove")}><DeleteIcon {...props} /></Pressable>
        </View>
    )


    React.useEffect(()=>{
        const getDataa=(text)=>{
            setError(false);
            setEmpty(false)
            if(text?.match(/\S/) !== null) {
                setLoading(true)
                Promise.all([
                    PNget(`/search?q=${encodeURIComponent(text)}`),
                    analytics().logSearch({search_term:text})
                ])
                .then((result)=>{
                    const res = result[0];
                    if(!Boolean(res?.error)) {
                        //console.log(res?.data?.[2]?.data);
                        if(res?.data?.length === 0) setEmpty(true)
                        setData(res?.data)
                    } else {
                        setError(true)
                    }
                })
                .catch(()=>setError(true))
                .finally(()=>{
                    setLoading(false)
                })
            }
        }
        async function getInitialData(){
            const dt = await AsyncStorage.getItem("search_history");
            await new Promise(async(res)=>{
                if(dt !== null) {
                    const his = JSON.parse(dt);
                    if(q) {
                        const qq = decodeURIComponent(q);
                        const index=his.findIndex((it)=>it.toLowerCase() === qq.toLowerCase() );
                        if(index === -1) {
                            his.unshift(qq);
                            his.splice(9,1)
                            setHistory(his)
                            await AsyncStorage.setItem("search_history",JSON.stringify(his));
                            res()
                        } else {
                            arrayMove.mutate(his,index,0);
                            setHistory(his)
                            await AsyncStorage.setItem("search_history",JSON.stringify(his));
                            res()
                        }
                    } else {
                        setHistory(his)
                        res()
                    }
                } else {
                    res()
                }
            })
            setTimeout(()=>{
                if(q) {
                    getDataa(decodeURIComponent(q));
                }
            },100)
            
        }
        getInitialData();

        return ()=>{
            setSearch("")
            setError(false);
            setEmpty(false)
            setData([])
        }
    },[])

    const customHeader=({scene})=>{
        const progress = Animated.add(scene.progress.current,scene.progress.next||0);
        const opacity = progress.interpolate({
            inputRange:[0,1,2],
            outputRange:[0,1,0]
        })
        return (
            <AnimLay style={{opacity,elevation:5,paddingHorizontal:15,justifyContent:'flex-start',alignItems:'center',paddingBottom:5,paddingTop:10,borderBottomColor:theme['border-basic-color'],borderBottomWidth:2}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flexGrow:1,marginRight:5,flexShrink:1}}>
                        <Input
                            ref={inputRef}
                            value={search}
                            onChangeText={setSearch}
                            textStyle={{marginHorizontal:0}}
                            placeholder="Search something..."
                            onSubmitEditing={()=>getData()}
                            returnKeyType="search"
                            accessoryRight={CloseButton}
                        />
                    </View>
                    <View style={{borderRadius:22,overflow:'hidden',marginBottom:5}}>
                        <Pressable onPress={()=>getData()} style={{padding:5}}><Icon name="search" width="25" height="25" fill={theme['text-basic-color']} /></Pressable>
                    </View>
                </View>
            </AnimLay>
        )
    }

    React.useEffect(()=>{
        if (filter) return navigation.navigate("SearchFilter",{...route.params})
    },[route])

    return (
        <Layout navigation={navigation} withBack={false} custom={customHeader}>
            <FlatList
                ref={ref}
                data={data}
                renderItem={renderItem}
                ListEmptyComponent={RenderEmpty}
                contentContainerStyle={{...(data?.length > 0 ? {} : {flex:1})}}
                keyExtractor={(item,index)=>`${item?.type}-${index}`}
            />
        </Layout>
    )
}