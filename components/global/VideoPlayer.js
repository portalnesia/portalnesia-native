import React from 'react';
import {Image,useWindowDimensions,View} from 'react-native'
import {Video} from 'expo-av'
import VideoPlayer from 'expo-video-player'
import {CONTENT_URL} from '@env'

const NativePlayer=({src,poster,height})=>{
    const {width} = useWindowDimensions()
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
}

export default function({iframe,...other}){
    if(iframe) return null
    return <NativePlayer {...other} />
}   