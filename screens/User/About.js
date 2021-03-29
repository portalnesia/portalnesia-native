import React from 'react'
import {View,Dimensions} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider} from '@ui-kitten/components'
import Skltn from 'react-native-skeleton-placeholder'

import RenderPrivate,{RenderSuspend} from './PrivateUser'
import Button from '@pn/components/global/Button'
import {Markdown} from '@pn/components/global/Parser'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

const IgIcon=(props)=><Icon {...props} name="instagram" pack="font_awesome" />
const TwIcon=(props)=><Icon {...props} name="twitter" pack="font_awesome" />
const FbIcon=(props)=><Icon {...props} name="facebook" pack="font_awesome" />
const LnIcon=(props)=><Icon {...props} name="line" pack="font_awesome" />
const TgIcon=(props)=><Icon {...props} name="telegram" pack="font_awesome" />

const SkeletonAbout=()=>{
    const theme=useTheme()
    return (
        <Lay style={{padding:15,justifyContent:'flex-end',flex:1,height:winHeight}}>
            <Skltn backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
                <View style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginBottom:20}}>
                    {[...Array(4).keys()].map((_,index)=>(
                        <Skltn.Item key={index} height={40} width={40} borderRadius={20} />
                    ))}
                </View>
                <View>
                    <Skltn.Item height={22} width={winWidth-30} marginBottom={5} borderRadius={5} />
                    <Skltn.Item height={22} width={winWidth-30} marginBottom={5} borderRadius={5} />
                    <Skltn.Item height={22} width={winWidth/2} borderRadius={5} />
                </View>
            </Skltn>
        </Lay>
    )
}

export default function UserAbout({data,error}){
    if((!data && !error) || (data?.error || error)) return <SkeletonAbout />
    if(data?.users?.private===true) return <RenderPrivate data={data} />
    if(data?.users?.suspend===true) return <RenderSuspend />
    return (
        <Lay style={{paddingVertical:15,height:winHeight}}>
            <View style={{paddingHorizontal:15,flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                {data?.users?.instagram && (
                    <Button appearance="ghost" status="basic" size="medium" accessoryLeft={IgIcon} />
                )}
                {data?.users?.twitter && (
                    <Button appearance="ghost" status="basic" size="medium" accessoryLeft={TwIcon} />
                )}
                {data?.users?.facebook && (
                    <Button appearance="ghost" status="basic" size="medium" accessoryLeft={FbIcon} />
                )}
                {data?.users?.line && (
                    <Button appearance="ghost" status="basic" size="medium" accessoryLeft={LnIcon} />
                )}
                {data?.users?.telegram && (
                    <Button appearance="ghost" status="basic" size="medium" accessoryLeft={TgIcon} />
                )}
            </View>
            {(data?.users?.biodata && data?.users?.biodata?.match(/\S/) !== null) ? (
                <View style={{marginTop:20}}>
                    <Markdown source={data?.users?.biodata}/>
                </View>
            ) : null}
        </Lay>
    )
}