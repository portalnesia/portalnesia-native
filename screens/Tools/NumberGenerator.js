import React from 'react';
import {  View,ScrollView,useWindowDimensions } from 'react-native';
import {Layout as Lay,Text,Input,useTheme,Toggle} from '@ui-kitten/components'
import i18n from 'i18n-js'

import Tooltip from '@pn/components/global/Tooltip'
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import Pagination from '@pn/components/global/Pagination'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/Context';

export default function({navigation}){
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [result,setResult]=React.useState(0)
    const [open,setOpen]=React.useState(false)
    const [value,setValue]=React.useState({min:0,max:0});
    const [error,setError]=React.useState({min:false,max:false});
    const [errText,setErrText]=React.useState({min:[],max:[]});
    const [anim,setAnim]=React.useState(true);
    const [loading,setLoading] = React.useState(false)
    const {copyText} = useClipboard()
    const {height,width}=useWindowDimensions()
    const theme = useTheme()
    const inputMax = React.useRef(null)
    
    const handleChange=(name,val)=>{
        setError({
            max:false,
            min:false
        });
        setValue({
            ...value,
            [name]:val
        })
        if(name==='min'){
            if(val.length === 0 || Number(val) < 0 || Number(value.max) <= Number(val)) {
                setError({
                    ...error,
                    min:true
                });
                const text=[];
                if(val.length === 0) text.push(i18n.t("random_number.specify.min"));
                if(Number(val) < 0) text.push(i18n.t("random_number.less.min",{number:"0"}))
                if(Number(value.max) < Number(val)) text.push(i18n.t("random_number.than.min"))
                if(Number(value.max) === Number(val)) text.push(i18n.t("random_number.same"))
                setErrText({
                    max:[],
                    min:text
                })
            } else {
                setErrText({
                    max:[],
                    min:[]
                });
            }
        } else if(name==='max'){
            if(val.length === 0 || Number(val) > 10000 || Number(value.min) >= Number(val)) {
                setError({
                    ...error,
                    max:true
                });
                const text=[];
                if(val.length === 0) text.push(i18n.t("random_number.specify.max"));
                if(Number(val) > 10000) text.push(i18n.t("random_number.less.max",{number:"10000"}))
                if(Number(value.min) > Number(val)) text.push(i18n.t("random_number.than.max"))
                if(Number(value.min) === Number(val)) text.push(i18n.t("random_number.same"))
                setErrText({
                    min:[],
                    max:text
                })
            } else {
                setErrText({
                    min:[],
                    max:[]
                });
            }
        }
    }

    const handleReset=()=>{
        setResult(0)
        setValue({
            min:0,
            max:0
        })
        setError({
            min:false,
            max:false
        })
        setErrText({
            min:[],
            max:[]
        })
    }

    const handleGenerate=React.useCallback(()=>{
        let min=Number.parseInt(value.min),max=Number.parseInt(value.max),durasi=5000,started = new Date().getTime();
        if(value.min.length === 0 || value.max.length === 0 || min >= value.max || min < 0 || max > 10000 || error.min || error.max) return setNotif(true,"Error","Minimum number or maximum number error");
        
        if(anim) {
            setLoading(true);
            let generator=setInterval(function(){
                if (new Date().getTime() - started > durasi) {
                    clearInterval(generator);
                    setLoading(false)
                } else {
                    let number=Math.floor(Math.random() * (+max+1 - +min)) + +min;
                    setResult(number)
                }
            },50);
        } else {
            setResult(Math.floor(Math.random() * (+max+1 - +min)) + +min);
        }
    },[error,value,anim])

    return (
        <>
            <Layout navigation={navigation} title="Random Number Generator" subtitle="Tools" withBack menu={()=><MenuToggle onPress={()=>{setOpen(true)}} />}>
                <ScrollView
                    contentContainerStyle={{
                        flex:1,flexDirection:'column',justifyContent:'flex-start',
                        backgroundColor:theme['background-basic-color-1']
                    }}
                    keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                >
                    <Lay><AdsBanners /></Lay>
                    <Lay key={0} style={{paddingTop:10,flex:1,justifyContent:'flex-start'}}>
                        <Lay style={[style.container,{paddingVertical:30,alignItems:'center',justifyContent:'center'}]}>
                            <Text category="h1" style={{fontSize:50}}>{result}</Text>
                        </Lay>
                        <Lay style={{flexGrow:1}}>
                            <Lay style={[style.container,{paddingTop:10,flexDirection:'row',justifyContent:'center',alignItems:'flex-start'}]}>
                                <Lay style={{flex:1,marginRight:2}}>
                                    <Input
                                        value={String(value.min)}
                                        onChangeText={(text)=>handleChange('min',text)}
                                        label={i18n.t("random_number.min")}
                                        caption={(props)=>(
                                            <Text {...props}>{errText.min.join("\n")}</Text>
                                        )}
                                        status={error.min ? "danger" : "basic"}
                                        keyboardType='numeric'
                                        onSubmitEditing={()=>{
                                            inputMax?.current?.focus()
                                        }}
                                        returnKeyType="next"
                                        disabled={loading}
                                        blurOnSubmit={false}
                                    />
                                </Lay>
                                <Lay style={{flex:1,marginLeft:2}}>
                                    <Input
                                        ref={inputMax}
                                        value={String(value.max)}
                                        onChangeText={(text)=>handleChange('max',text)}
                                        label={i18n.t("random_number.max")}
                                        caption={(props)=>(
                                            <Text {...props}>{errText.max.join("\n")}</Text>
                                        )}
                                        status={error.max ? "danger" : "basic"}
                                        keyboardType='numeric'
                                        returnKeyType="go"
                                        onSubmitEditing={handleGenerate}
                                        blurOnSubmit={false}
                                        disabled={loading}
                                    />
                                </Lay>
                            </Lay>
                            <Lay style={[style.container,{flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'space-between'}]}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text>{i18n.t('random_number.animation')}</Text>
                                    <Tooltip style={{marginLeft:5}} tooltip={i18n.t('random_number.animation_help')} name="question-mark-circle-outline" />
                                </View>
                                <Toggle  disabled={loading} checked={anim} onChange={setAnim} />
                            </Lay>
                        </Lay>
                        <Lay style={{marginVertical:10}}>
                            <AdsBanner />
                        </Lay>
                        <Lay style={{justifyContent:'flex-end',flexDirection:'column'}}>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button onPress={handleReset} disabled={loading} status="danger">Reset</Button>
                            </Lay>
                            <Lay style={[style.container,{paddingVertical:5}]}>
                                <Button loading={loading} disabled={loading} onPress={handleGenerate}>Generate</Button>
                            </Lay>
                        </Lay>
                        
                    </Lay>
                </ScrollView>
            </Layout>
            <MenuContainer
                visible={open}
                handleOpen={()=>setOpen(true)}
                handleClose={()=>setOpen(false)}
                onClose={()=>setOpen(false)}
                type="tools"
                item_id="number_generator"
                share={{
                    link:`/random-number?utm_campaign=tools`,
                    title:`Random Number Generator - Portalnesia`
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
                },{
                    title:i18n.t('feedback'),
                    action:'feedback'
                }]}
            />
        </>
    )
}