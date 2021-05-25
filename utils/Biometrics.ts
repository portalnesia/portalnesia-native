import React from 'react'
import Biometrics,{CreateSignatureOptions,SimplePromptOptions,CreateSignatureResult} from 'react-native-biometrics'
import { generateRandom } from './Main';

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
        if(!deleted) throw {message:"Key exists! Error when delete the keys"}
    }

    const {publicKey} = await Biometrics.createKeys();
    return publicKey;
}

export async function deleteKeys(){
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
    if(result.error && result?.error != 'User cancellation') throw {message:result.error}

    return {...result,payload};
}

export async function promptAuthentication(options?: Partial<SimplePromptOptions>){
    const option: SimplePromptOptions = {
        ...options,
        promptMessage:"Verify Your Identity"
    }
    const result = await Biometrics.simplePrompt(option);
    if(result.error) throw {message:result.error}

    return result.success;
}