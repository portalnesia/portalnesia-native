import React from 'react';
import {  View,ScrollView,useWindowDimensions,KeyboardAvoidingView } from 'react-native';
import {Layout as Lay,Text,Card,Spinner,Input,List,ListItem,Divider,useTheme,Toggle} from '@ui-kitten/components'
import useSWR from '@pn/utils/swr'
import Modal from 'react-native-modal'

//import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import useAPI from '@pn/utils/API'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import Pagination from '@pn/components/global/Pagination'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/AuthProvider';
import Recaptcha from '@pn/components/global/Recaptcha'

const HeaderModal=React.memo(({search,setSearch,setPage})=>{
    return (
        <Lay style={{padding:5}}>
            <Input
                placeholder="Type EPSG or name or area to search..."
                value={search}
                onChangeText={(text)=>{
                    setSearch(text)
                    setPage(1)
                }}
            />
        </Lay>
    )
})

export default function({navigation}){
    const {PNpost} = useAPI(false)
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [search,setSearch] = React.useState("")
    const [input,setInput] = React.useState("")
    const [output,setOutput] = React.useState("")
    const [loading,setLoading] = React.useState(false)
    const [recaptcha,setRecaptcha]=React.useState("");
    const {copyText} = useClipboard()
    const textRef=React.useRef(null)
    const [page,setPage]=React.useState(1)
    const [modal,setModal]=React.useState(null)
    const {data,error}=useSWR(`/geodata/epsg?page=${page}&q=${encodeURIComponent(search)}`,{},false)
    const {height,width}=useWindowDimensions()
    const [scrollOffset,setScrollOffset] = React.useState(null)
    const theme = useTheme()
    const [total,setTotal]=React.useState(1)
    const [sistem,setSistem]=React.useState({insrc:"EPSG:4326",outsrc:"EPSG:4326"})
    const [switchVal,setSwitch]=React.useState({switch:false,add_input:false})
    const captcha = React.useRef(null)

    const onReceiveToken=(token)=>{
        setRecaptcha(token)
    }


    const onModalChange=type=>value=>{
        setSistem({...sistem,[type]:value})
        setModal(null)
    }

    React.useEffect(()=>{
        if(data) setTotal(data?.total_page)
    },[data])

    const scrollRef = React.useRef(null)

    const scrollTo=p=>{
        if(scrollRef.current.scrollToOffset) {
            scrollRef.current.scrollToOffset(p)
        }
    }
    const footerModal=()=>(
        <>
        {!data && !error && (
            <Lay style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:70}}><Spinner size="giant" /></Lay>
        )}
        <Lay style={{flexDirection:'row',justifyContent:'center',alignItems:'center',paddingBottom:40,paddingTop:10,paddingHorizontal:15}}>
            <Pagination page={page} total={total} onChange={(pg)=>setPage(pg)} />
        </Lay>
        </>
    )

    const onSubmit=()=>{
        if(input?.match(/\S+/g) === null) return  setNotif("error","Input cannot be empty")
        const post={
            ...switchVal,
            ...sistem,
            recaptcha,
            input
        }
        setLoading(true)
        PNpost(`/geodata/transform`,post)
        .then((res)=>{
            if(res?.msg !== null) setNotif(!(Boolean(res.error)),"Info",res.msg)
            if(res?.output?.length) setOutput(res.output);
        })
        .finally(()=>{
            setLoading(false)
            captcha?.current?.refreshToken()
        })
    }

    return (
        <>
            <Layout navigation={navigation} title="Transform Coordinate" subtitle="Geodata" withBack>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1
                    }}
                >
                    <Lay key={0} style={{paddingTop:10,paddingBottom:40}}>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text style={{marginBottom:15}}>This on-line tool allows you to insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection. You can insert value pairs to the text area labeled as "Input coordinate pairs" - also by using copy/paste even from MS Excell or similar programs. This tool accepts various input formats of value pairs - only what you need is to have one pair by a row. Please see examples in the input text area window.</Text>
                            <Text>It is necessary to set appropriate input coordinate system and to set desired output coordinate system to which you want to transform the input coordinate pairs.</Text>
                        </Lay>
                        <AdsBanner />
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text style={{fontFamily:'Inter_SemiBold'}}>{`Input Coordinate System / Projection`}</Text>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <Text style={{marginRight:10}}>{`${sistem.insrc}`}</Text>
                                <Button appearance="ghost" status="basic" onPress={()=>!loading && setModal("insrc")}>Change</Button>
                            </View>
                            <View style={{flexDirection:'row',alignItems:'center',marginBottom:10}}><Toggle checked={switchVal.switch} disabled={loading} onChange={(val)=>setSwitch({...switchVal,switch:val})}>{`Switch X <--> Y`}</Toggle></View>
                            <Input
                                label="Input Coordinate Pairs*"
                                value={input}
                                onChangeText={(text)=>setInput(text)}
                                multiline
                                disabled={loading}
                                textStyle={{minHeight:150,maxHeight:350}}
                                textAlignVertical="top"
                                placeholder="Decimal values formats, example:&#13;&#10;18.5;54.2&#13;&#10;113.4 46.78&#13;&#10;16.9,67.8&#13;&#10;Geodetic or GPS formats, example:&#13;&#10;41°26'47&quot;N 71°58'36&quot;W&#13;&#10;42d26'47&quot;N;72d58'36&quot;W&#13;&#10;43d26'46&quot;N,73d56'55&quot;W"
                            />
                        </Lay>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text style={{fontFamily:'Inter_SemiBold'}}>{`Output Coordinate System / Projection`}</Text>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <Text style={{marginRight:10}}>{`${sistem.outsrc}`}</Text>
                                <Button appearance="ghost" status="basic" onPress={()=>!loading && setModal("outsrc")}>Change</Button>
                            </View>
                            <View style={{flexDirection:'row',alignItems:'center',marginBottom:10}}><Toggle disabled={loading} checked={switchVal.add_input} onChange={(val)=>setSwitch({...switchVal,add_input:val})}>{`Include input coordinates`}</Toggle></View>
                            <Input
                                label="Output Coordinate Pairs"
                                value={output}
                                multiline
                                editable={false}
                                ref={textRef}
                                onFocus={()=>{
                                    if(output.length > 0) copyText(output,"Text")
                                    textRef?.current?.blur();
                                }}
                                textStyle={{minHeight:128,maxHeight:328}}
                                textAlignVertical="top"
                            />
                        </Lay>
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Text><Text style={{fontFamily:'Inter_Bold'}}>Beware!</Text> <Text>Inserted values pairs needs to be in order X-coordinate and then Y-coordinate. If you are inserting latitude/longitude values in decimal format, then the longitude should be first value of the pair (X-coordinate) and latitude the second value (Y-coordinate). Otherwise you can use choice "Switch XY" bellow the input text area window.</Text></Text>
                        </Lay>
                        <AdsBanners />
                        <Lay style={[style.container,{paddingVertical:10}]}>
                            <Button size="medium" onPress={onSubmit} loading={loading} disabled={loading}>Transform</Button>
                        </Lay>
                    </Lay>
                </ScrollView>
            </Layout>
            <Modal
                isVisible={modal!==null}
                onBackdropPress={()=>setModal(null)}
                propagateSwipe
                swipeDirection={['down']}
                onSwipeComplete={()=>setModal(null)}
                style={{justifyContent:'flex-end',margin:0}}
                scrollTo={scrollTo}
                onModalHide={()=>{
                    setPage(1)
                    setSearch("")
                }}
            >
                <KeyboardAvoidingView pointerEvents="box-none" behavior="height">
                    <View style={{maxHeight:height-60}}>
                        <View key={`view-0`} style={{alignItems:'center',justifyContent:'center',padding:9,backgroundColor:theme['background-basic-color-1'],borderTopRightRadius:25,borderTopLeftRadius:25}}>
                            <View style={{width:60,height:7,backgroundColor:theme['text-hint-color'],borderRadius:5}} />
                        </View>
                        <View key={`view-1`}>
                            <List
                                ref={scrollRef}
                                ListHeaderComponent={<HeaderModal search={search} setSearch={setSearch} setPage={setPage} />}
                                ListFooterComponent={footerModal}
                                data={data?.data||[]}
                                renderItem={(props)=><RenderRow {...props} onChange={onModalChange(modal)} />}
                                ItemSeparatorComponent={Divider}
                                keyExtractor={(item)=>item.epsg}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Recaptcha ref={captcha} onReceiveToken={onReceiveToken} />
        </>
    )
}

const RenderRow=React.memo(({item,index,onChange})=>(
    <ListItem key={index} title={`EPSG:${item?.epsg}`} description={`${item.name}\n${item.area_of_use}`} onPress={()=>onChange(`EPSG:${item?.epsg}`)} />
))