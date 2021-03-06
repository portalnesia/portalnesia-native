import React from 'react';
import {Image,Dimensions,View} from 'react-native'
import {useTheme,Text} from '@ui-kitten/components'
import {Video} from 'expo-av'
import VideoPlayer from 'expo-video-player'
import {CONTENT_URL,YOUTUBE_KEY} from '@env'
import i18n from 'i18n-js'
import Youtube,{YouTubeStandaloneAndroid} from 'react-native-youtube'
import compareVersion from 'compare-versions'
import {Constants} from 'react-native-unimodules'
import Pressable from './Pressable'

const {width:winWidth} = Dimensions.get('window')
const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"1.4.0",">=");

const NativePlayer=React.memo(({src,poster,height,width: vidWidth})=>{
    const width = vidWidth||winWidth;
    const [ratio,setRatio] = React.useState(null)
    const [full,setFull] = React.useState(false)
    const videoRef=React.useRef(null)
    
    const finalHeight = React.useMemo(()=>{
        if(height) return height
        const rat = ratio !== null ? ratio : (3 / 4)
        return width * rat
    },[ratio,height,width])

    React.useEffect(()=>{
        if(!height) {
            Image.getSize(poster,(w,h)=>{
                setRatio(h/w)
            },()=>{})
        }
    },[height])

    const handleFullScreen=React.useCallback((isFull)=>()=>{
        setFull(isFull)
        if(isFull) videoRef.current?.presentFullscreenPlayer()
        else videoRef.current?.dismissFullscreenPlayer()
    },[])
    const onFullscreenUpdate=React.useCallback(({fullscreenUpdate})=>{
        if(fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
            setFull(false)
        }
    },[])

    return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <VideoPlayer
                videoProps={{
                    shouldPlay:false,
                    resizeMode: Video.RESIZE_MODE_CONTAIN,
                    source: {
                        uri: src,
                    },
                    posterSource:{
                        uri:`${CONTENT_URL}/img/url?size=800&image=${poster}`
                    },
                    usePoster:true,
                    ref:videoRef,
                    onFullscreenUpdate
                }}
                fullscreen={{
                    inFullscreen:full,
                    enterFullscreen:handleFullScreen(true),
                    exitFullscreen:handleFullScreen(false)
                }}
                style={{
                    width,
                    height:finalHeight
                }}
            />
        </View>
    )
})

const YoutubePlayer=React.memo(({youtube,width: vidWidth,style,youtubeOptions={}})=>{
    const width = vidWidth||winWidth
    const theme = useTheme();
    const [ytError,setYtError]=React.useState(false)
    const handleError=React.useCallback((e)=>{
        console.log("Player error",e);
        if(['SERVICE_INVALID','SERVICE_MISSING','SERVICE_DISABLED'].indexOf(e?.error) !== -1) {
            setYtError(true);
        }
    },[]);

    React.useEffect(()=>{

        return ()=>{
            setYtError(false)
        }
    },[])

    const handlePress=React.useCallback(async()=>{
        try {
            await YouTubeStandaloneAndroid.playVideo({
                apiKey: YOUTUBE_KEY,
                videoId:youtube,
            })
        } catch(e){
            console.log(e)
        }
    },[youtube])

    if(ytError) {
        return (
            <Pressable onPress={handlePress} style={[{marginTop:10,width,height:(9*width/16),justifyContent:'center',alignSelf:'center',paddingHorizontal:15,backgroundColor:theme['background-basic-color-2']},style]}>
                <Text style={{textAlign:'center'}}>{i18n.t('errors.youtube_service')}</Text>
            </Pressable>
        )
    }
    if(typeof youtube === 'string') {
        return (
            <Youtube
                apiKey={YOUTUBE_KEY}
                videoId={youtube}
                style={[{width,height:(9*width/16)},style]}
                onError={handleError}
                controls={1}
                resumePlayAndroid={false}
                {...youtubeOptions}
            />
        )
    }
    return null;
})

export default React.memo(({iframe,youtube,width,style,youtubeOptions,...other})=>{
    if(iframe) return null
    if(youtube) {
        if(isUpdated) return <YoutubePlayer youtube={youtube} width={width} style={style} youtubeOptions={youtubeOptions} />
        else return null;
    }
    return <NativePlayer {...other} width={width} style={style} />
})