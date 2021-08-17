import React from 'react'
import {View,Dimensions,Animated} from 'react-native'
import {Text,useTheme} from '@ui-kitten/components'
import TrackPlayer,{usePlaybackState,State} from 'react-native-track-player'

import FastImage from '@pn/module/FastImage'
import Pressable from '@pn/components/global/Pressable'
import {MiniHeaderTypes} from './types'
import s from './styles'
import useTrackPlayer,{ togglePlayback,useTrackEvents } from './Action'
import {PlayIcon,NextIcon,DownIcon,CloseIcon,PauseIcon} from './icon'

const {height:winHeight,width:winWidth} = Dimensions.get("window");

const MiniHeader=({animated,modalRef,handle,queueAnim,qHandle}: MiniHeaderTypes)=>{
    const theme = useTheme();
    const playbackState = usePlaybackState();
    const {title,artwork} = useTrackEvents();
    const {destroyPlayer} = useTrackPlayer();
    return (
        <>
            <Animated.View
                style={[
                    s.content__cover,
                    {
                        shadowOpacity:Animated.subtract(animated,queueAnim).interpolate({
                            inputRange:[0,1],
                            outputRange:[0.2,0.35]
                        })
                    }
                ]}
            >
                <Animated.Image
                    style={{
                        width:winWidth-200,
                        height:winWidth-200,
                        marginTop:-55,
                        marginLeft:-60,
                        transform:[
                            {
                                scale:Animated.subtract(animated,queueAnim).interpolate({
                                    inputRange:[0,1],
                                    outputRange:[0.18,1],
                                    extrapolate:"clamp"
                                }),
                                translateX:Animated.subtract(animated,queueAnim).interpolate({
                                    inputRange:[0,0.75],
                                    outputRange:[0,((winWidth-200)/2)+60],
                                    extrapolate:"clamp"
                                }),
                                translateY:Animated.subtract(animated,queueAnim).interpolate({
                                    inputRange:[0,0.75],
                                    outputRange:[0,150],
                                    extrapolate:"clamp"
                                }),
                            }
                        ]
                    }}
                    source={{uri:(artwork as string)}}
                />
            </Animated.View>
            
            <Animated.View
                style={[s.content__header,{
                    ...(!handle || qHandle ? {zIndex:15} : {}),
                    opacity:Animated.subtract(animated,queueAnim).interpolate({
                        inputRange:[0,0.75],
                        outputRange:[1,0]
                    })
                }]}
            >
                <View style={{paddingLeft:50,flexGrow:1,flexShrink:1}}><Text numberOfLines={1}>{title}</Text></View>

                <View style={{borderRadius:22,overflow:'hidden'}}>
                    <Pressable style={{padding:10,...(playbackState == State.Playing ? {paddingRight:13,paddingLeft:13} : {paddingRight:10,paddingLeft:15})}} onPress={()=>togglePlayback(playbackState)}>
                        {playbackState == State.Playing ? (
                            <PauseIcon style={{width:20,height:20,tintColor:theme['text-hint-color']}} />
                        ) : (
                            <PlayIcon style={{width:20,height:20,tintColor:theme['text-hint-color']}} />
                        )}
                    </Pressable>
                </View>

                <View style={{borderRadius:22,overflow:'hidden'}}>
                    <Pressable style={{padding:7}} onPress={()=>TrackPlayer.skipToNext()}>
                        <NextIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                    </Pressable>
                </View>

                <View style={{borderRadius:22,overflow:'hidden'}}>
                    <Pressable style={{padding:7}} onPress={destroyPlayer}>
                        <CloseIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                    </Pressable>
                </View>
            </Animated.View>

            <Animated.View
                style={[s.content__header,{
                    ...(handle && !qHandle ? {zIndex:15} : {}),
                    opacity:Animated.subtract(animated,queueAnim).interpolate({
                        inputRange:[0.6,1],
                        outputRange:[0,1]
                    })
                }]}
            >
                <View style={{borderRadius:22,overflow:'hidden',marginLeft:-5}}>
                    <Pressable style={{padding:10}} onPress={()=>modalRef.current?.close('alwaysOpen')}>
                        <DownIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                    </Pressable>
                </View>
                <Text>Portalnesia Music Player</Text>
            </Animated.View>

        </>
    )
}

export default React.memo(MiniHeader);