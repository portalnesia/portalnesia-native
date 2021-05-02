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

const {width} = Dimensions.get('window')
const isUpdated = compareVersion.compare(Constants.nativeAppVersion,"1.4.0",">=");

const NativePlayer=React.memo(({src,poster,height})=>{
    const [ratio,setRatio] = React.useState(null)
    const [full,setFull] = React.useState(false)
    const [videoRef,setVideoRef]=React.useState(null)
    
    const finalHeight = React.useMemo(()=>{
        if(height) return height
        const rat = ratio !== null ? ratio : (3 / 4)
        return width * rat
    },[ratio,height])

    React.useEffect(()=>{
        if(!height) {
            Image.getSize(poster,(w,h)=>{
                setRatio(h/w)
            },()=>{})
        }
    },[height])

    const handleFullScreen=(isFull)=>()=>{
        setFull(isFull)
        if(isFull) videoRef?.presentFullscreenPlayer()
        else videoRef?.dismissFullscreenPlayer()
    }
    const onFullscreenUpdate=({fullscreenUpdate})=>{
        if(fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
            setFull(false)
        }
    }

    return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <VideoPlayer
                videoProps={{
                    resizeMode: Video.RESIZE_MODE_CONTAIN,
                    source: {
                        uri: src,
                    },
                    posterSource:{
                        uri:`${CONTENT_URL}/img/url?size=800&image=${poster}`
                    },
                    usePoster:true,
                    videoRef:(ref)=>setVideoRef(ref),
                    onFullscreenUpdate
                }}
                inFullscreen={full}
                width={width}
                height={finalHeight}
                switchToLandscape={handleFullScreen(true)}
                switchToPortrait={handleFullScreen(false)}
            />
        </View>
    )
})

const YoutubePlayer=React.memo(({youtube})=>{
    const theme = useTheme();
    const [ytError,setYtError]=React.useState(false)
    const handleError=React.useCallback((e)=>{
        if(['SERVICE_INVALID','SERVICE_MISSING','SERVICE_DISABLED'].indexOf(e?.error) !== null) {
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
            <Pressable onPress={handlePress} style={{marginTop:10,width,height:(9*width/16),flex:1,justifyContent:'center',alignSelf:'center',paddingHorizontal:15,backgroundColor:theme['background-basic-color-2']}}>
                <Text style={{textAlign:'center'}}>{i18n.t('errors.youtube_service')}</Text>
            </Pressable>
        )
    }
    if(typeof youtube === 'string') {
        return (
            <Youtube
                apiKey={YOUTUBE_KEY}
                videoId={youtube}
                style={{width,height:(9*width/16)}}
                onError={handleError}
                controls={1}
            />
        )
    }
    return null;
})

export default React.memo(({iframe,youtube,...other})=>{
    if(iframe) return null
    if(youtube) {
        if(isUpdated) return <YoutubePlayer youtube={youtube} />
        else return null;
    }
    return <NativePlayer {...other} />
})