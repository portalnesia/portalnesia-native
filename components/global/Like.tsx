import React from 'react'
import {View,ActivityIndicator} from 'react-native'
import {AxiosRequestConfig} from 'axios'
import useAPI, {ApiResponse} from '@pn/utils/API'
import {Icon,useTheme,Text} from '@ui-kitten/components'
import i18n from 'i18n-js'
import useSelector from '@pn/provider/actions'
import Pressable from './Pressable'
import { AuthContext } from '@pn/provider/Context'
import Spinner from './Spinner'

type PNpostType = <D = {liked: boolean}>(url: string, data?: {
    [key: string]: any;
}, formdata?: AxiosRequestConfig, catchError?: boolean) => Promise<ApiResponse<D>>

export async function sentLike(PNpost: PNpostType,type: string, item_id: string|number) {
    const res = await PNpost(`/backend/like`,{type,id:item_id})
    return res;
}

export interface LikeProps {
    value: boolean;
    onSuccess(result: boolean): void;
    type: string;
    item_id: string|number;
}

function LikeButton({value,onSuccess,type,item_id}: LikeProps) {
    const context = React.useContext(AuthContext);
    const {setNotif} = context;
    const user = useSelector(state=>state.user)
    if(!user) return null;
    const theme = useTheme();
    const [loading,setLoading] = React.useState(false);
    const {PNpost} = useAPI();

    const onPress=React.useCallback(async()=>{
        setLoading(true)
        try {
            const res = await sentLike(PNpost,type,item_id);
            if(typeof res?.liked !== 'undefined') {
                onSuccess(res.liked);
                setNotif(false,"Success");
            }
        } catch(e){
            
        } finally {
            setLoading(false);
        }
    },[type,item_id,PNpost])
    
    return (
        <View style={{flexDirection:'row',alignItems:"center"}}>
            <View style={{borderRadius:22,overflow:'hidden'}}>
                <Pressable onPress={onPress} style={{padding:5,paddingHorizontal:5}} disabled={loading} tooltip={value ? i18n.t("unlike") : i18n.t("like")}>
                    <View style={{flexDirection:'row',alignItems:"center"}}>
                        <Icon width="20" height="20" style={{marginHorizontal:0,tintColor:theme['color-danger-500'],width:20,height:20}} name={value ? "heart" : "heart-outline"} />
                        {loading ? (
                            <Spinner style={{marginLeft:5}} />
                        ) : (
                            <Text style={{marginLeft:5,fontSize:14}}>{value ? i18n.t("unlike") : i18n.t("like")}</Text>
                        )}
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

export default React.memo(LikeButton);