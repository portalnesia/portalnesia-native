import TrackPlayer,{Event} from 'react-native-track-player'
import store from '@pn/provider/store'

export default async function TrackPlayerService(){
    TrackPlayer.addEventListener(Event.RemotePlay,()=>TrackPlayer.play())
    TrackPlayer.addEventListener(Event.RemotePause,()=>TrackPlayer.pause())
    TrackPlayer.addEventListener(Event.RemoteStop,()=>{
        TrackPlayer.destroy()
        store.dispatch({type:"MANUAL",payload:{musicPlayer:false,musicPlayerUpdate:0}})
    })
    TrackPlayer.addEventListener(Event.RemoteSeek,(position)=>TrackPlayer.seekTo(position))
    TrackPlayer.addEventListener(Event.RemoteNext,()=>TrackPlayer.skipToNext())
    TrackPlayer.addEventListener(Event.RemotePrevious,async()=>{
        const position = await TrackPlayer.getPosition();
        if(position < 10) TrackPlayer.skipToPrevious()
        else TrackPlayer.seekTo(0);
    })
    return Promise.resolve();
}