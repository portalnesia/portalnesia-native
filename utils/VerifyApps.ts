import {Alert} from 'react-native'

import PNSafety from '@pn/module/Safety'
import Portalnesia from '@pn/module/Portalnesia'
import API from '@pn/utils/axios'
import i18n from 'i18n-js'
import { log, logError } from './log'
import * as Secure from 'expo-secure-store'
import moment from 'moment'

async function alertWarning(msg: string) {
    return new Promise<void>(res=>{
        Alert.alert(
            `${i18n.t("warning")}!`,
            msg,
            [{
                text:"OK",
                onPress:()=>{
                    Portalnesia.exitApp();
                    res();
                }
            }]
        )
    })
}

async function checkGoogleServices() {
    const isGooglePlayServicesAvailable = await PNSafety.isGooglePlayServicesAvailable();
    if(!isGooglePlayServicesAvailable) {
        log(`Google Play Service Unavailable`);
        throw new Error(i18n.t("errors.google_play_available"))
    }
    return;
}

type RemoteResult = {err:boolean,verify:boolean,token:string|null,nonce:string|null}
async function checkRemoteVerification(force=true): Promise<RemoteResult> {
    let result: RemoteResult={err:true,verify:false,token:null,nonce:null};
    try {
        const response = await API.get(`/native/safety/check_verify?force=${force}`)
        const res = response?.data;
        result.err = Boolean(res?.error);
        result.verify = Boolean(res?.verify);
        if(res?.token) {
            result.token = res?.token;
        }
        if(res?.nonce) result.nonce = res?.nonce;
        return result;
    } catch(e) {
        log(`Check remote verification ${e?.message}`);
        logError(e,"Check remote verification error");
        throw new Error(typeof e?.response?.data?.msg === 'string' ? e?.response?.data?.msg : e?.message)
    }
}

type LocalResult = {verify:boolean,signature?:string}
async function checkLocalVerification() {
    const local = await Secure.getItemAsync('signature');
    let result: LocalResult = {verify:false,signature:null};
    if(local !== null) {
        const loc = JSON.parse(local);
        console.log(loc);
        const locMoment = moment(loc?.date).add(7,"d");
        if(moment().isBefore(locMoment)) {
            result.signature = loc?.signature;
            result.verify = true;
        }
    }
    return result;
}

async function verifyNative(token: string,nonce: string) {
    try {
        let safe: string="";
        try {
            safe = await PNSafety.getVerification(nonce);
        } catch(e) {
            log(`Safety native verification ${e?.message}`);
            logError(e,"Safety native verification error");
            throw new Error(i18n.t("errors.verify_failed"))
        }
        const qs=require('qs');
        const data = {
            result: safe,
            token
        }
        const response = await API.post("/native/safety/verify",qs.stringify(data));
        const res = response?.data;
        if(res?.error == 1) {
            if(res?.status==="failed") throw new Error(i18n.t("errors.verify_failed"));
            throw new Error(typeof res?.msg === 'string' ? res?.msg : i18n.t('errors.general'))
        }
        const save = {
            signature:res?.signature,
            date: moment().format("YYYY-MM-DD HH:mm:ss").toString()
        }
        await Secure.setItemAsync("signature",JSON.stringify(save));
        return Promise.resolve();
    } catch(e) {
        log(`Remote verification ${e?.message}`);
        logError(e,"Remote verification error");
        if(e?.response?.data?.status==="failed") throw new Error(i18n.t("errors.verify_failed"));
        throw new Error(typeof e?.response?.data?.msg === 'string' ? e?.response?.data?.msg : e?.message)
    }
}

async function newVerification() {
    await checkGoogleServices();
    const remote = await checkRemoteVerification();
    await verifyNative(remote?.token,remote?.nonce);
    return Promise.resolve();
}

export default async function verifyApps() {
    try {
        const requireVerify = await checkLocalVerification();
        if(!requireVerify.verify) {
            console.log("NEW SIGNATURE");
            await newVerification();
        }
        return Promise.resolve();
    } catch(e) {
        log(`Safety verification ${e?.message}`);
        logError(e,"Verification error");
        await alertWarning(e?.message)
    }
}