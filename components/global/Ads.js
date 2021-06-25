import React from 'react'
import {View} from 'react-native'
import Constants from 'expo-constants';
import {ADS_BANNER,ADS_BANNER_2,ADS_INTERSTISIAL} from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {AdMobBanner,AdMobInterstitial} from 'expo-ads-admob'
import { log } from '@pn/utils/log';

const BannerID_1 = Constants.isDevice && !__DEV__ ? ADS_BANNER : "ca-app-pub-3940256099942544/6300978111";
const BannerID_2 = Constants.isDevice && !__DEV__ ? ADS_BANNER_2 : "ca-app-pub-3940256099942544/6300978111";
const InterID = Constants.isDevice && !__DEV__ ? ADS_INTERSTISIAL : "ca-app-pub-3940256099942544/1033173712";

export const AdsBanner=React.memo(({size})=>{
    //const [error,setError] = React.useState(false);
    const siz=React.useMemo(()=>size==="MEDIUM_RECTANGLE" ? "mediumRectangle" : "smartBanner",[size])
    const onError=React.useCallback((e)=>{
        console.log("Banner1",e);
        log("Ads error",{extra: String(e)});
        //setError(true);
    },[])
    const [personalized,setPersonalized]=React.useState(true);
    React.useEffect(()=>{
        (async function(){
            try {
                const ads = await AsyncStorage.getItem("ads");
                if(ads==="false") setPersonalized(false);
            } catch(e){

            }
        })()
    },[])

    //if(error) return null;
    return (
        <View style={{justifyContent:'center',flexDirection:'row'}}>
            <AdMobBanner
                bannerSize={siz}
                adUnitID={BannerID_1}
                servePersonalizedAds={personalized}
                onDidFailToReceiveAdWithError={onError}
            />
        </View>
    )
})

export const AdsBanners=React.memo(({size})=>{
    //const [error,setError] = React.useState(false);
    const siz=React.useMemo(()=>size==="MEDIUM_RECTANGLE" ? "mediumRectangle" : "smartBanner",[size])
    const onError=React.useCallback((e)=>{
        console.log("Banner2",e);
        log("Ads error",{extra: String(e)});
        //setError(true);
    },[])
    const [personalized,setPersonalized]=React.useState(true);
    React.useEffect(()=>{
        (async function(){
            try {
                const ads = await AsyncStorage.getItem("ads");
                if(ads==="false") setPersonalized(false);
            } catch(e){

            }
        })()
    },[])
    //if(error) return null;
    return (
        <View style={{justifyContent:'center',flexDirection:'row'}}>
            <AdMobBanner
                bannerSize={siz}
                adUnitID={BannerID_2}
                servePersonalizedAds={personalized}
                onDidFailToReceiveAdWithError={onError}
            />
        </View>
    )
})

export function showInterstisial(){
    const [personalized,setPersonalized]=React.useState(true);
    React.useEffect(()=>{
        (async function(){
            try {
                await AdMobInterstitial.setAdUnitID(InterID);
                const ads = await AsyncStorage.getItem("ads");
                if(ads==="false") setPersonalized(false);
            } catch(e){
            
            }
        })()
    },[])
    const showAds=async()=>{
        try {
            await AdMobInterstitial.requestAdAsync({servePersonalizedAds:personalized})
            await AdMobInterstitial.showAdAsync();
        } catch(e){

        }
    }
    return {showAds}
}