import React from 'react'
import {View,Dimensions,Animated,InteractionManager} from 'react-native'
import {Text,useTheme} from '@ui-kitten/components'
import Slider from '@react-native-community/slider'
import TrackPlayer,{usePlaybackState,useProgress,State} from 'react-native-track-player'
import {useSelector,useDispatch} from '@pn/provider/actions'
import Pressable from '@pn/components/global/Pressable'
import {MiniHeaderTypes} from './types'
import {PlayIcon,PauseIcon,NextIcon,PrevIcon,VolumeOffIcon,VolumeOnIcon} from './icon'
import { togglePlayback,useTrackEvents } from './Action'
const {height:winHeight,width:winWidth} = Dimensions.get("window");

const RenderPlayer=({animated,queueAnim}:MiniHeaderTypes)=>{
    const track = useSelector(state=>state.musicPlayer);
    const theme = useTheme();
    const progress = useProgress();
    const playbackState = usePlaybackState();
    const {title,artist} = useTrackEvents();
    const [timeProg,setTimeProg]=React.useState(progress);
    const [volume,setVolume] = React.useState(1);
    const [muted,setMuted] = React.useState<null|number>(null)

    React.useEffect(()=>{
        async function handleVolume(){
            if(!track) setVolume(1);
            else {
                const vol = await TrackPlayer.getVolume();
                setVolume(vol);
            }
        }
        handleVolume();
    },[track])

    React.useEffect(()=>{
        (async function(){
            await TrackPlayer.setVolume(volume);
        })();
    },[volume])

    React.useEffect(()=>{
        (async function(){
            if(track) {
                const duration = await TrackPlayer.getDuration();
                setTimeProg({...timeProg,duration})
            }
        })()
    },[title,track])

    React.useEffect(()=>{
        if(track) setTimeProg(progress);
    },[progress,track])

    const onSliding=React.useCallback((value)=>{
        InteractionManager.runAfterInteractions(async()=>{
            const aa = {...timeProg,position:value};
            setTimeProg(aa)
            await TrackPlayer.seekTo(value)
            return Promise.resolve();
        })
        
    },[timeProg])

    const handleVolume = React.useCallback(()=>{
        InteractionManager.runAfterInteractions(()=>{
            if(volume !== 0) {
                setMuted(volume)
                setVolume(0);
            }
            else {
                setVolume(muted);
                setMuted(null)
            }
        })
    },[volume,muted])

    const onSkipPrevious=React.useCallback(()=>{
        InteractionManager.runAfterInteractions(async()=>{
            const position = await TrackPlayer.getPosition();
            if(position < 10) TrackPlayer.skipToPrevious()
            else TrackPlayer.seekTo(0);
            return Promise.resolve();
        })
        
    },[])

    return(
        <>
            <Animated.View
                style={{
                    paddingHorizontal:20,
                    opacity:Animated.subtract(animated,queueAnim).interpolate({
                        inputRange:[0.25,0.75],
                        outputRange:[0,1]
                    }),
                    transform:[
                        {
                            translateY:Animated.subtract(animated,queueAnim).interpolate({
                                inputRange:[0,1],
                                outputRange:[-200,0]
                            })
                        }
                    ]
                }}
            >
                <View style={{alignItems:'center',justifyContent:'center',marginVertical:30,paddingHorizontal:10}}>
                    <Text category="h4" style={{fontFamily:"Inter_Medium",marginBottom:10,textAlign:"center"}} numberOfLines={2}>{title}</Text>
                    <Text category="h6" numberOfLines={1} style={{textAlign:"center"}}>{artist}</Text>
                </View>

                <View style={{marginBottom:10}}>
                    <Slider
                        value={progress.position}
                        minimumValue={0}
                        maximumValue={progress.duration}
                        onSlidingComplete={onSliding}
                        thumbTintColor={theme['color-indicator-bar']}
                        style={{height:40,width:winWidth-40,flexDirection:'row'}}
                    />
                    <View style={{marginHorizontal:15,marginTop:-5,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Text style={{fontSize:13}}>{new Date(timeProg.position * 1000).toISOString().substr(14,5)}</Text>
                        <Text style={{fontSize:13}}>{new Date((timeProg.duration) * 1000).toISOString().substr(14,5)}</Text>
                    </View>
                </View>

                <View style={{marginTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{borderRadius:42,overflow:'hidden'}}>
                        <Pressable style={{padding:10}} onPress={onSkipPrevious}>
                            <PrevIcon style={{width:40,height:40,tintColor:theme['text-hint-color']}} />
                        </Pressable>
                    </View>

                    <View style={{borderRadius:62,overflow:'hidden'}}>
                        <Pressable style={{padding:18,paddingRight:20,...(playbackState == State.Playing ? {paddingLeft:20} : {paddingLeft:25})}} onPress={()=>togglePlayback(playbackState)}>
                            {playbackState == State.Playing ? (
                                <PauseIcon style={{width:40,height:40,tintColor:theme['text-hint-color']}} />
                            ) : (
                                <PlayIcon style={{width:40,height:40,tintColor:theme['text-hint-color'],marginLeft:10}} />
                            )}
                        </Pressable>
                    </View>

                    <View style={{borderRadius:42,overflow:'hidden'}}>
                        <Pressable style={{padding:10}} onPress={()=>TrackPlayer.skipToNext()}>
                            <NextIcon style={{width:40,height:40,tintColor:theme['text-hint-color']}} />
                        </Pressable>
                    </View>
                </View>

                <View style={{marginTop:30,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{borderRadius:22,overflow:'hidden',marginLeft:10}}>
                        <Pressable style={{padding:10}} tooltip={muted !== null ? "Unmute" : "Mute"} onPress={handleVolume}>
                            {muted !== null ? (
                                <VolumeOffIcon style={{width:20,height:20,tintColor:theme['text-hint-color']}} />
                            ) : (
                                <VolumeOnIcon style={{width:20,height:20,tintColor:theme['text-hint-color']}} />
                            )}
                        </Pressable>
                    </View>
                    <Slider
                        value={volume}
                        minimumValue={0}
                        maximumValue={1}
                        onSlidingComplete={setVolume}
                        thumbTintColor={theme['color-indicator-bar']}
                        style={{height:30,flex:1,flexDirection:'row'}}
                    />
                </View>
            </Animated.View>
        </>
    )
}

export default React.memo(RenderPlayer)