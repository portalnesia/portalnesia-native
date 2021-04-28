import React from 'react'
import {View} from 'react-native'
import Constants from 'expo-constants';
import admob,{MaxAdContentRating,BannerAd,BannerAdSize,TestIds, InterstitialAd, AdsConsentStatus, AdEventType} from '@react-native-firebase/admob'
import {ADS_BANNER,ADS_BANNER_2,ADS_INTERSTISIAL} from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import compareVersion from 'compare-versions'

const BannerID_1 = Constants.isDevice && !__DEV__ ? ADS_BANNER : TestIds.BANNER;
const BannerID_2 = Constants.isDevice && !__DEV__ ? ADS_BANNER_2 : TestIds.BANNER;
const InterID = Constants.isDevice && !__DEV__ ? ADS_INTERSTISIAL : TestIds.INTERSTITIAL;

const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"1.3.0",">=");

export const AdsBanner=React.memo(({size})=>{
    const [sizeAds,setSize]=React.useState(()=>typeof size==='undefined' ? BannerAdSize.SMART_BANNER : size)
    const [load,setLoad] = React.useState(false)
    const [ads,setAds] = React.useState(false)
    React.useEffect(()=>{
        if(isUpdated) {
            admob().setRequestConfiguration({
                maxAdContentRating:MaxAdContentRating.G,
                tagForChildDirectedTreatment:true,
                tagForUnderAgeOfConsent:true
            })
            .then(()=>AsyncStorage.getItem('ads'))
            .then((val)=>{
                return new Promise(res=>{
                    const personalizedAdsOnly = val === null || val != AdsConsentStatus.NON_PERSONALIZED ? false : true
                    setAds(personalizedAdsOnly);
                    res();
                })
            })
            .then(()=>setLoad(true))
            .catch(()=>{})
        }
    },[])
    React.useEffect(()=>{
        if(size) setSize(size)
    },[size])
    if(!load) return null;
    return (
        <View style={{justifyContent:'center',flexDirection:'row'}}>
            <BannerAd
                unitId={BannerID_1}
                size={sizeAds}
                requestOptions={{
                    requestNonPersonalizedAdsOnly:ads
                }}
            />
        </View>
    )
})

export const AdsBanners=React.memo(({size})=>{
    const [sizeAds,setSize]=React.useState(()=>typeof size==='undefined' ? BannerAdSize.SMART_BANNER : size)
    const [load,setLoad] = React.useState(false)
    const [ads,setAds] = React.useState(false)
    React.useEffect(()=>{
        if(isUpdated) {
            admob().setRequestConfiguration({
                maxAdContentRating:MaxAdContentRating.G,
                tagForChildDirectedTreatment:true,
                tagForUnderAgeOfConsent:true
            })
            .then(()=>AsyncStorage.getItem('ads'))
            .then((val)=>{
                return new Promise(res=>{
                    const personalizedAdsOnly = val === null || val != AdsConsentStatus.NON_PERSONALIZED ? false : true
                    setAds(personalizedAdsOnly);
                    res();
                })
            })
            .then(()=>setLoad(true))
            .catch(()=>{})
        }
    },[])
    React.useEffect(()=>{
        if(size) setSize(size)
    },[size])
    if(!load) return null;
    return (
        <View style={{justifyContent:'center',flexDirection:'row'}}>
            <BannerAd
                unitId={BannerID_2}
                size={sizeAds}
                requestOptions={{
                    requestNonPersonalizedAdsOnly:ads
                }}
            />
        </View>
    )
})

export function showInterstisial(){
    const [loaded,setLoaded]=React.useState(false)
    const interstisial = InterstitialAd.createForAdRequest(InterID);
    React.useEffect(()=>{
        const eventListener = interstisial.onAdEvent(type=>{
            if(type == AdEventType.LOADED) {
                setLoaded(true)
            }
        })
        interstisial.load();
        return ()=>{
            eventListener();
        }
    },[])

    const showAds=()=>{
        console.log(loaded)
        if(loaded) interstisial.show();
    }
    return {showAds}
}