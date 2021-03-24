import React from 'react';
import {  View,ScrollView,useWindowDimensions } from 'react-native';
import {Layout as Lay,Text,Spinner,Input,useTheme} from '@ui-kitten/components'


//import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import style from '@pn/components/global/style'
import Button from '@pn/components/global/Button'
import Pagination from '@pn/components/global/Pagination'
import useClipboard from '@pn/utils/clipboard'
import { AuthContext } from '@pn/provider/AuthProvider';


export default function({navigation}){
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [result,setResult]=React.useState(0)
    const [value,setValue]=React.useState({min:0,max:0});
    const [error,setError]=React.useState({min:false,max:false});
    const [errText,setErrText]=React.useState({min:[],max:[]});
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
                if(val.length === 0) text.push("Please specify a minimum number");
                if(Number(val) < 0) text.push("The minimum number must be greater than 0")
                if(Number(value.max) < Number(val)) text.push("The minimum number must be less than the maximum number")
                if(Number(value.max) === Number(val)) text.push("The minimum number and the maximum number can not be the same number")
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
                if(val.length === 0) text.push("Please specify a maximum number");
                if(Number(val) > 10000) text.push("The maximum number must be less than 10000")
                if(Number(value.min) > Number(val)) text.push("The maximum number must be greater than the minimum number")
                if(Number(value.min) === Number(val)) text.push("The minimum number and the maximum number can not be the same number")
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

    const handleGenerate=()=>{
        if(value.min.length === 0 || value.max.length === 0 || Number(value.min) >= Number(value.max) || Number(value.min) < 0 || Number(value.max) > 10000 || error.min || error.max) return setNotif(true,"Error","Minimum number or maximum number error");
        setLoading(true);
        let min=value.min,max=value.max,durasi=5000,started = new Date().getTime();
        let generator=setInterval(function(){
            if (new Date().getTime() - started > durasi) {

                clearInterval(generator);
                setLoading(false)
            } else {
                let number=Math.floor(Math.random() * (+max+1 - +min)) + +min;
                setResult(number)
            }
        },50);
    }

    return (
        <>
            <Layout navigation={navigation} title="Random Number Generator" subtitle="Tools" withBack>
                <ScrollView
                    contentContainerStyle={{
                        flex:1,flexDirection:'column',justifyContent:'flex-start',
                        backgroundColor:theme['background-basic-color-1']
                    }}
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
                                        label="Minimum Number"
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
                                        label="Maximum Number"
                                        caption={(props)=>(
                                            <Text {...props}>{errText.max.join("\n")}</Text>
                                        )}
                                        status={error.max ? "danger" : "basic"}
                                        keyboardType='numeric'
                                        returnKeyType="go"
                                        onSubmitEditing={handleGenerate}
                                        disabled={loading}
                                    />
                                </Lay>
                            </Lay>
                        </Lay>
                        <Lay style={{marginVertical:10}}>
                            <AdsBanner />
                        </Lay>
                        <Lay style={{flex:1,justifyContent:'flex-end',flexDirection:'column'}}>
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

        </>
    )
}