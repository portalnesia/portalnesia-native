import React from 'react'
import Constants from 'expo-constants';
import {
    AdMobBanner,
    AdMobInterstitial,
    //AdMobRewarded,
    isAvailableAsync
} from 'expo-ads-admob';
import {ADS_BANNER,ADS_BANNER_2,ADS_INTERSTISIAL} from '@env'
//import {View,useWindowDimensions} from 'react-native'

const testID = 'ca-app-pub-3940256099942544/6300978111';

export const AdsBanner=React.memo((props)=>{
    const productionID = ADS_BANNER;
    // Is a real device and running in production.
    //const adUnitID = productionID;
    const adUnitID = Constants.isDevice && !__DEV__ ? productionID : testID;
    return (
            <AdMobBanner
                {...props}
                adUnitID={adUnitID} // Test ID, Replace with your-admob-unit-id
                servePersonalizedAds // true or false
            />
        
    )
})

export const AdsBanners=React.memo((props)=>{
    const productionID = ADS_BANNER_2;
    //const adUnitID = productionID
    const adUnitID = Constants.isDevice && !__DEV__ ? productionID : testID;
    return (
        <AdMobBanner
            {...props}
            adUnitID={adUnitID} // Test ID, Replace with your-admob-unit-id
            servePersonalizedAds // true or false
        />
    )
})

export async function showInterstisial(){
    if(!__DEV__) {
        //const intersTestID = ['ca-app-pub-3940256099942544/1033173712','ca-app-pub-3940256099942544/8691691433'];
        //const random = Math.floor(Math.random() * 2);
        const productionID = ADS_INTERSTISIAL;
        // Is a real device and running in production.
        const adUnitID = productionID
        //const adUnitID = Constants.isDevice && !__DEV__ ? productionID : intersTestID[random];

        const isThere = await isAvailableAsync()
        if(isThere) {
            await AdMobInterstitial.setAdUnitID(adUnitID); // Test ID, Replace with your-admob-unit-id
            await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true});
            await AdMobInterstitial.showAdAsync();
        }
    }
}