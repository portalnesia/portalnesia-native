import React from 'react';
import {  View,ScrollView,RefreshControl } from 'react-native';
import {Layout as Lay,Text,Spinner,useTheme } from '@ui-kitten/components'

import {FeedbackToggle} from '@pn/components/global/MoreMenu'
import Layout from '@pn/components/global/Layout';
import axios from 'axios'
import Button from '@pn/components/global/Button'
import { AuthContext } from '@pn/provider/Context';
import i18n from 'i18n-js';
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import NotFoundScreen from './NotFound'
import NotFound from '@pn/components/global/NotFound'
import {CONTENT_URL,URL} from '@env'
import useSWR from '@pn/utils/swr'
import { generateRandom, number_size } from '@portalnesia/utils';
import downloadFile,{DIRECTORY_DOWNLOADS,DIRECTORY_MUSIC,DIRECTORY_PICTURES} from '@pn/utils/Download'

let timeInterval=null,timeLeft=15;
const renderToggle=()=>(
    <FeedbackToggle />
)

export default function DownloadFileScreen({navigation,route}) {
    const token = route.params?.token;
    if(!token) return <NotFoundScreen navigation={navigation} route={route} />

    const {data,error,mutate,isValidating}=useSWR(`/backend/download_file?token=${token}`,{},true);
    const theme = useTheme();
    const [token2,setToken] = React.useState(null);
    const [loading,setLoading] = React.useState(false);
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const [validate,setValidate]=React.useState(false)
    const [isTimer,setIsTimer] = React.useState(false);
    const [timer,setTimer] = React.useState(15);
    const [canDownload,setCanDownload] = React.useState(true);

    React.useEffect(()=>{
        if(!isValidating) setValidate(false);
    },[isValidating])

    const handleGenerateDownload=React.useCallback(async()=>{
        setLoading(true);

        if(token2===null) {
            try {
                const res_format = await axios.post(`${CONTENT_URL}/download`,`token=${token}`);
                const res = res_format.data;
                if(!Boolean(res?.error)) {
                    setNotif(false,"Success",res?.msg);
                    startTimer();
                    setToken(res?.token);
                } else {
                    setNotif(true,"Error",res?.msg);
                }
            } catch(e) {
                if(e?.response?.data) {
                    setNotif("error","Error",typeof e?.response?.data?.msg === 'string' ? e?.response?.data?.msg :i18n.t('errors.general'));
                }
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const res_format = await axios.post(`${CONTENT_URL}/download?native`,`download_token=${token2}`);
                const res = res_format.data;
                if(!Boolean(res?.error)) {
                    handleDownload(res?.token);
                } else {
                    setNotif(true,"Error",res?.msg);
                }
            } catch(e) {
                if(e?.response?.data) {
                    setNotif("error","Error",typeof e?.response?.data?.msg === 'string' ? e?.response?.data?.msg :i18n.t('errors.general'));
                }
            } finally {
                setLoading(false);
            }
        }

    },[startTimer,token,token2])

    const handleDownload=React.useCallback(async(token)=>{
        const filename = generateRandom(10) + "_" + data?.file?.title;
        const url = CONTENT_URL + "/download_files?token=" + token;
        let dirType = DIRECTORY_DOWNLOADS;
        if(data?.file?.type?.match(/images\/+/) != null) {
            dirType = DIRECTORY_PICTURES;
        } else if(data?.file?.type?.match(/audio\/+/) != null) {
            dirType = DIRECTORY_MUSIC;
        }
        try {
            const down = downloadFile(url,filename,data?.file?.type,dirType)
            if(down) {
                setNotif(false,"Download","Start downloading...");
                down.start();
                navigation?.goBack();
            }
        } catch(err) {
            setNotif(true,"Error",err?.message||"Something went wrong");
        }
    },[navigation,data])

    const startTimer=()=>{
        setCanDownload(false);
        setIsTimer(true);
        setTimer(15);
        timeLeft=15;
        timeInterval = setInterval(()=>{
            if(timeLeft === 0) {
                clearInterval(timeInterval);
                setCanDownload(true);
                setIsTimer(false);
                return;
            }
            timeLeft-=1;
            setTimer(timeLeft);
        },1000)
    }

    React.useEffect(()=>{

        return ()=>{
            if(timeInterval !== null) clearInterval(timeInterval);
        }
    },[])
    
    return (
        <>
            <Layout navigation={navigation} title="Download" withBack menu={renderToggle}>
                <ScrollView contentContainerStyle={{backgroundColor:theme['background-basic-color-1'],...(!data && !error ? {flex:1} : {flexGrow:1})}} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                    {...(error || data?.error ? {refreshControl:<RefreshControl refreshing={validate} onRefresh={()=>{!validate && (setValidate(true),mutate())}} colors={['white']} progressBackgroundColor="#2f6f4e" />} : {})}
                >
                    {!data && !error ? (
                        <Lay style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Spinner size="large" />
                        </Lay>
                    ) : error || data?.error ? (
                        <NotFound status={data?.code||503}><Text>{(data?.msg)||"Something went wrong"}</Text></NotFound>
                    ) : (
                        <Lay>
                            <AdsBanner />
                            <View style={{marginHorizontal: 15,marginVertical:15}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text category="h6">Filename</Text>
                                    <Text category="h6">{`: ${data?.file?.title}`}</Text>
                                </View>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text category="h5">Size</Text>
                                    <Text category="h5">{`: ${number_size(data?.file?.size)}`}</Text>
                                </View>
                                {isTimer && (
                                    <View style={{marginVertical:15,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                        {timer > 0 && <Text category="h5">Please wait...</Text>}
                                        <View>
                                            <Text category="h1" style={{fontSize:90}}>{timer}</Text>
                                        </View>
                                    </View>
                                )}
                                {canDownload && (
                                    <View style={{marginVertical:15}}>
                                        <Button disabled={loading} loading={loading} onPress={handleGenerateDownload}><Text style={{color:"white"}}>{token2 !== null ? "Download" : "Generate Link"}</Text></Button>
                                    </View>
                                )}
                                
                            </View>
                            <AdsBanners size="MEDIUM_RECTANGLE" />
                        </Lay>
                    )}
                </ScrollView>
            </Layout>
        </>
    )
}