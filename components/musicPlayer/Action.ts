import React from 'react'
import {Alert} from 'react-native'
import TrackPlayer,{Track,Capability,State, useTrackPlayerEvents,Event} from 'react-native-track-player'
import {useSelector,useDispatch} from '@pn/provider/actions'
import i18n from 'i18n-js'
import useAPI from '@pn/utils/API'

export default function useTrackPlayer(){
    const dispatch=useDispatch();
    const {PNget} = useAPI();

    const setupPlayer=React.useCallback(async(tracks:Track)=>{
        await TrackPlayer.setupPlayer({maxCacheSize:102400});
        await TrackPlayer.updateOptions({
            capabilities:[
                Capability.Pause,
                Capability.Play,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop,
                Capability.SeekTo
            ],
            compactCapabilities:[
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ],
            notificationCapabilities:[
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
                Capability.SeekTo,
                Capability.SkipToNext,
                Capability.SkipToPrevious
            ],
        })
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        dispatch({type:"MANUAL",payload:{musicPlayer:true,musicPlayerUpdate:0}})
        await TrackPlayer.play();
        PNget(`/media/other/${tracks.id}`)
        .then((res): Promise<Track[]|boolean> =>{
            const tracks: Track[] = res?.file?.map((d: any)=>{
                return {
                    id: d?.id,
                    id_number:d?.id_number,
                    title:d?.title,
                    artist:d?.artist,
                    url:d?.url,
                    artwork:d?.thumbs
                }
            })
            if(tracks?.length) {
                return Promise.resolve(tracks)
            } else {
                return Promise.resolve(false);
            }
        })
        .then((val)=>{
            if(typeof val !== 'boolean') return addQueue(val)
            else return Promise.resolve();
        })
        .catch(()=>{})
    },[])

    const addQueue=React.useCallback(async(tracks:Track|Track[],insertBefore?:number)=>{
        await TrackPlayer.add(tracks,insertBefore);
        dispatch({type:"MUSIC_PLAYER"})
    },[])

    const removeQueue=React.useCallback(async(tracks:number)=>{
        await TrackPlayer.remove(tracks);
        //dispatch({type:"MUSIC_PLAYER"})
    },[])

    const confirmDestroy=React.useCallback(()=>{
        dispatch({type:"MANUAL",payload:{musicPlayer:false,musicPlayerUpdate:0}})
        TrackPlayer.destroy();
    },[])

    const destroyPlayer=React.useCallback(async()=>{
        Alert.alert(
            i18n.t("errors.sure"),
            "Remove music player",
            [
                {
                    text:i18n.t("cancel"),
                    onPress:()=>{}
                },
                {
                    text:"OK",
                    onPress:confirmDestroy
                }
            ]
        )
    },[])

    const editQueue=React.useCallback(async(movedTrack: Track,from: number,to:number)=>{
        await TrackPlayer.remove(from);
        await TrackPlayer.add(movedTrack,to);
        //dispatch({type:"MUSIC_PLAYER"})
    },[])

    return {setupPlayer,addQueue,destroyPlayer,editQueue,removeQueue}
}

export async function togglePlayback(state: State){
    const current = await TrackPlayer.getCurrentTrack();
    if(current != null) {
        if(state === State.Paused) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }
    }
}

export function useTrackEvents(){
    const dispatch=useDispatch();
    const track = useSelector(state=>state.musicPlayer);
    const [title,setTitle]=React.useState<string|number>();
    const [artist,setArtist]=React.useState<string|number>();
    const [artwork,setArtwork]=React.useState<string|number>();
    const {PNget} = useAPI();

    React.useEffect(()=>{
        async function getData(){
            const current = await TrackPlayer.getCurrentTrack();
            if(current != null) {
                const track = await TrackPlayer.getTrack(current);
                const {title,artist,artwork} = track||{};
                setTitle(title);
                setArtist(artist);
                setArtwork(artwork);
            }
        }
        if(track) getData()
    },[track])

    useTrackPlayerEvents(
        [Event.PlaybackTrackChanged,Event.RemotePlay,Event.RemotePause,Event.RemoteStop,Event.RemoteSeek],
        async event=>{
            if(event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
                const track = await TrackPlayer.getTrack(event.nextTrack);
                const {title,artist,artwork,id} = track||{};
                setTitle(title);
                setArtist(artist);
                setArtwork(artwork);
                if(!__DEV__) await PNget(`/media/${id}/update`);
            } else if(event.type === Event.RemotePause) {
                TrackPlayer.pause();
            } else if(event.type === Event.RemotePlay) {
                TrackPlayer.play();
            } else if(event.type === Event.RemoteStop) {
                dispatch({type:"MANUAL",payload:{musicPlayer:false,musicPlayerUpdate:0}})
                TrackPlayer.destroy();
            } else if(event.type === Event.RemoteSeek) {
                console.log(event);
            } else if(event.type === Event.RemoteNext) {
                TrackPlayer.skipToNext()
            } else if(event.type === Event.RemotePrevious) {
                const position = await TrackPlayer.getPosition();
                if(position < 10) TrackPlayer.skipToPrevious()
                else TrackPlayer.seekTo(0);
            } 
        }
    )

    return {artist,title,artwork}
}