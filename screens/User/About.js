import React from 'react'
import {View,Dimensions, Animated, RefreshControl} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider} from '@ui-kitten/components'
import Skltn from 'react-native-skeleton-placeholder'

import RenderPrivate,{RenderSuspend} from './PrivateUser'
import Button from '@pn/components/global/Button'
import {Markdown} from '@pn/components/global/Parser'
import {TabBarHeight,HeaderHeight,ContentMinHeight} from './utils'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

const IgIcon=(props)=><Icon {...props} name="instagram" pack="font_awesome" />
const TwIcon=(props)=><Icon {...props} name="twitter" pack="font_awesome" />
const FbIcon=(props)=><Icon {...props} name="facebook" pack="font_awesome" />
const LnIcon=(props)=><Icon {...props} name="line" pack="font_awesome" />
const TgIcon=(props)=><Icon {...props} name="telegram" pack="font_awesome" />

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

function UserAbout({data,error,mutate,isValidating,onGetRef,scrollY,onMomentumScrollBegin,onMomentumScrollEnd,onScrollEndDrag}){
    return (
        <Animated.ScrollView
            scrollToOverflowEnabled
            ref={onGetRef}
            onScroll={Animated.event(
                [
                    {nativeEvent:{contentOffset:{y:scrollY}}}
                ],
                {
                    useNativeDriver:true
                }
            )}
            onMomentumScrollBegin={onMomentumScrollBegin}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={onScrollEndDrag}
            contentContainerStyle={{
                paddingTop:HeaderHeight + TabBarHeight + 56,
                minHeight:winHeight + ContentMinHeight
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    style={{zIndex:5}}
                    colors={['white']}
                    progressBackgroundColor="#2f6f4e"
                    refreshing={data && isValidating}
                    progressViewOffset={HeaderHeight + TabBarHeight + 56}
                    title="Refreshing"
                    onRefresh={()=>!isValidating && mutate()}
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
            )}
        </Animated.ScrollView>
    )
}

export default React.memo(UserAbout)