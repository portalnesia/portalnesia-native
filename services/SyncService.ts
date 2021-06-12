import * as Secure from 'expo-secure-store'
import {TokenResponse} from 'expo-auth-session'
import {refreshingToken,getProfile} from '@pn/utils/Login'
import Authentication from '@pn/module/Authentication'

async function getToken(){
    const token_string = await Secure.getItemAsync('token');
    const token: TokenResponse|null = token_string===null ? null : JSON.parse(token_string);
    if(token===null) throw Error("Token not found");

    try {
        const date_now = Number((new Date().getTime()/1000).toFixed(0));
        if((date_now - token.issuedAt) > ((token.expiresIn||3600) - 300)) {
            const new_token = await refreshingToken(token);
            await Secure.setItemAsync('token',JSON.stringify(new_token));
            return new_token;
        } else {
            return token;
        }
    } catch(e) {
        return token;
    }
}

async function SyncAdapter(){
    console.log("Sync Adapter",new Date().getTime());
    const accounts = await Authentication.getAccounts();
    const account = accounts[0];
    if(account?.name) {
        try {
            const token = await getToken();
            const user = await getProfile(token);
            if(typeof user !== 'string') {
                if(typeof user?.email === 'string' && account.name !== user.email) await Authentication.renameAccount(account,user?.email);
                await Secure.setItemAsync('user',JSON.stringify(user))
            }
            return Promise.resolve();
        } catch(e) {
            return Promise.resolve();
        }
    } else return Promise.resolve();
}
export default SyncAdapter;