import React from 'react'
import Biometrics,{CreateSignatureOptions,SimplePromptOptions,CreateSignatureResult} from 'react-native-biometrics'
import { generateRandom } from '@portalnesia/utils';
import * as Secure from 'expo-secure-store'

class BiometricsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BiometricsError";
    }
}

export async function enableLockSetting() {
    const {biometryType,available} = await Biometrics.isSensorAvailable();
    if(available && biometryType === Biometrics.Biometrics) {
        const exist = await biometricsExist();
        if(exist) {
            await Secure.setItemAsync("lock_fingerprint","true");
        }
    }
}
export async function disableLockSetting() {
    await Secure.deleteItemAsync("lock_fingerprint");
}

export function useBiometrics(){
    const [fingerprint,setFingerprint] = React.useState(false)
    const [exist,setExist] = React.useState(false);

    React.useEffect(()=>{
        Biometrics.isSensorAvailable()
        .then(({biometryType,available})=>{
            if(available && biometryType === Biometrics.Biometrics) setFingerprint(true);
            else setFingerprint(false)
            return Promise.resolve();
        })
        .then(()=>{
            return biometricsExist();
        })
        .then((exists)=>{
            setExist(exists);
        })
        .catch(e=>console.log(e));
    },[])

    return {supported:fingerprint,biometricsExist:exist};
}

export async function biometricsExist(){
    const {keysExist} = await Biometrics.biometricKeysExist();
    return keysExist;
}

export async function createKeys(){
    const exist = await biometricsExist();
    if(exist) {
        const deleted = await deleteKeys();
        if(!deleted) throw new BiometricsError("Key exists! Error when delete the keys")
    }

    const {publicKey} = await Biometrics.createKeys();
    return publicKey;
}

export async function deleteKeys(){
    await disableLockSetting();
    const {keysDeleted} = await Biometrics.deleteKeys()
    return keysDeleted;
}

function generatePayload() {
    const date = Math.round((new Date()).getTime() / 1000).toString();
    return `${date}${generateRandom(20)}`;
}

interface VerifyBiometricsResult extends CreateSignatureResult {
    payload:string
}

export async function verifyAuthentication(options?: Partial<CreateSignatureOptions>): Promise<VerifyBiometricsResult>{
    const payload = options?.payload || generatePayload();
    const promptMessage = options?.promptMessage || "Verify Your Account";
    const option: CreateSignatureOptions = {
        ...options,
        payload,
        promptMessage
    }

    const result = await Biometrics.createSignature(option);
    if(result.error && result?.error != 'User cancellation') throw new BiometricsError(result?.error);

    return {...result,payload};
}

export async function promptAuthentication(options?: Partial<SimplePromptOptions>){
    const option: SimplePromptOptions = {
        ...options,
        promptMessage:"Verify Your Identity"
    }
    const result = await Biometrics.simplePrompt(option);
    if(result.error) throw new BiometricsError(result?.error == 'User cancellation' ? "Verification failed" : result?.error)

    return result.success;
}