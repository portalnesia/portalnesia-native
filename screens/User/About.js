import React from 'react'
import {View,Dimensions, Animated, RefreshControl} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider} from '@ui-kitten/components'
import Skltn from 'react-native-skeleton-placeholder'

import Pressable from '@pn/components/global/Pressable'
import RenderPrivate,{RenderSuspend} from './PrivateUser'
import Button from '@pn/components/global/Button'
import {Markdown} from '@pn/components/global/Parser'
import {TabBarHeight,HeaderHeight,ContentMinHeight} from './utils'
import { openBrowser } from '@pn/utils/Main'
import {  ucwords } from '@portalnesia/utils'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

const SkeletonAbout=()=>{
    const theme=useTheme()
    return (
        <Skltn height={winHeight} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Skltn.Item paddingTop={20}>
                <View style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginBottom:20}}>
                    {[...Array(4).keys()].map((_,index)=>(
                        <Skltn.Item key={index} height={40} width={40} borderRadius={20} />
                    ))}
                </View>
                <View style={{paddingHorizontal:15}}>
                    <Skltn.Item height={22} width={winWidth-30} marginBottom={5} borderRadius={5} />
                    <Skltn.Item height={22} width={winWidth-30} marginBottom={5} borderRadius={5} />
                    <Skltn.Item height={22} width={winWidth/2} borderRadius={5} />
                </View>
            </Skltn.Item>
        </Skltn>
    )
}

const IconSocial = React.memo(({style,name}) => <Icon style={style} name={name} pack="font_awesome" />)

const SocialWrapper = React.memo(({name,onPress})=>{
    const theme = useTheme();
    return (
        <View style={{borderRadius:22,overflow:'hidden'}}>
            <Pressable style={{padding:8}} onPress={onPress} tooltip={ucwords(name)}>
                <View style={{width:26,height:26,justifyContent:'center',alignItems:'center'}}>
                <IconSocial style={{height:24,tintColor:theme['text-hint-color']}} name={name} /></View>
            </Pressable>
        </View>
    )
})

function UserAbout({data,error,mutate,isValidating,onGetRef,onScroll,containerPaddingTop,scrollIndicatorInsetTop,onScrollEndDrag}){
    const socialClick=React.useCallback((url)=>{
        openBrowser(url,false)
    },[])
    const theme = useTheme();
    return (
        <Animated.ScrollView
            scrollToOverflowEnabled
            ref={onGetRef}
            onScroll={onScroll}
            contentContainerStyle={{
                paddingTop:HeaderHeight + containerPaddingTop,
                minHeight:winHeight + ContentMinHeight
            }}
            onScrollEndDrag={onScrollEndDrag}
            scrollIndicatorInsets={{top:HeaderHeight+scrollIndicatorInsetTop}}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    style={{zIndex:5}}
                    colors={['white']}
                    progressBackgroundColor="#2f6f4e"
                    refreshing={isValidating}
                    progressViewOffset={HeaderHeight + containerPaddingTop}
                    title="Refreshing"
                    onRefresh={mutate}
                />
            }
        >
            {(!data && !error) || (data?.error || error) ? (
                <SkeletonAbout />
            ) : data?.users?.private===true ? (
                <RenderPrivate data={data} />
            ) : data?.users?.suspend===true ? (
                <RenderSuspend />
            ) : (
                <Lay style={{paddingVertical:15}}>
                    <View style={{paddingHorizontal:15,paddingBottom:15,flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                        {data?.users?.instagram && (
                            <SocialWrapper name="instagram" onPress={()=>socialClick(data?.users?.instagram)} />
                        )}
                        {data?.users?.twitter && (
                            <SocialWrapper name="twitter" onPress={()=>socialClick(data?.users?.twitter)} />
                        )}
                        {data?.users?.facebook && (
                            <SocialWrapper name="facebook" onPress={()=>socialClick(data?.users?.facebook)} />
                        )}
                        {data?.users?.line && (
                            <SocialWrapper name="line" onPress={()=>socialClick(data?.users?.line)} />
                        )}
                        {data?.users?.telegram && (
                            <SocialWrapper name="telegram" onPress={()=>socialClick(data?.users?.telegram)} />
                        )}
                    </View>
                    {data?.users?.birthday && (
                        <Lay style={{elevation:1,paddingHorizontal:15,paddingVertical:15}}>
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <View style={{marginRight:15}}>
                                    <Icon style={{height:20,tintColor:theme['text-hint-color']}} name="birthday-cake" pack="font_awesome" />
                                </View>
                                <Text>{data?.users?.birthday}</Text>
                            </View>
                        </Lay>
                    )}
                    {(data?.users?.biodata && data?.users?.biodata?.match(/\S/) !== null) ? (
                        <View style={{marginTop:20}}>
                            <Markdown source={data?.users?.biodata}/>
                        </View>
                    ) : null}
                </Lay>
            )}
        </Animated.ScrollView>
    )
}

export default React.memo(UserAbout)