import React from 'react'
import {View,Dimensions,Animated,LogBox} from 'react-native'
import {Text,useTheme,Divider} from '@ui-kitten/components'
import TrackPlayer,{Track} from 'react-native-track-player'
import {useSelector,useDispatch} from '@pn/provider/actions'
import Pressable from '@pn/components/global/Pressable'
import ListItem from '@pn/components/global/ListItem'
import {MiniHeaderTypes} from './types'
import {DragIcon} from './icon'
import Avatar from '@pn/components/global/Avatar'
import useTrackPlayer,{useTrackEvents} from './Action'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import i18n from 'i18n-js'
import Draggable,{RenderItemParams} from 'react-native-draggable-flatlist'

LogBox.ignoreLogs([
    "ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component is no longer"
])

const MemoAvatar=React.memo(({src}: {src:string})=>(
    <Avatar style={{marginRight:10}} src={src} size={45} />
))
const swipeRef = React.createRef<Swipeable>();
const {height:winHeight,width:winWidth} = Dimensions.get("window");

interface ListTypes extends RenderItemParams<Track> {
    onRemove(track:number): void
}

const RenderList=({item,index,drag,isActive,onRemove}: ListTypes)=>{
    const theme = useTheme();
    const updated = useSelector(state=>state.musicPlayerUpdate);
    const [current,setCurrent] = React.useState(0);
    const {title} = useTrackEvents();
    const track = useSelector(state=>state.musicPlayer);

    React.useEffect(()=>{
        if(track) {
            TrackPlayer.getCurrentTrack().then(curr=>{
                setCurrent(curr);
            })
        }
    },[title,track,updated])

    const swipeLeft = React.useCallback(()=>{
        return (
            <View style={{justifyContent:'center',alignItems:"flex-end",width:winWidth,paddingRight:30,backgroundColor:theme['color-danger-500']}}>
                <Text style={{color:'#fff',textAlign:'right'}}>{i18n.t('remove')}</Text>
            </View>
        )
    },[theme])

    const onSwipeLeft=React.useCallback(()=>{
        onRemove(index)
    },[])

    return (
        <>
            {current !== index ? (
                <Swipeable
                    ref={swipeRef}
                    rightThreshold={(winWidth/2)+100}
                    renderRightActions={swipeLeft}
                    onSwipeableRightOpen={onSwipeLeft}
                >
                    <ListItem
                        onPress={()=>TrackPlayer.skip(index)}
                        key={index.toString()}
                        title={item?.title}
                        description={item?.artist}
                        accessoryLeft={()=><MemoAvatar src={(item?.artwork as string)} />}
                        style={{paddingVertical:10,paddingHorizontal:5,...(current === index ? {backgroundColor:theme['background-basic-color-2']} : isActive ? {backgroundColor:theme['background-basic-color-3']} : {backgroundColor:theme['background-basic-color-1']})}} 
                        {...(current !== index ? {
                            accessoryRight:()=>(
                                <Pressable default onPressIn={drag}>
                                    <DragIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                                </Pressable>
                            )
                        } : {})}
                    />
                </Swipeable>
            ) : (
                <ListItem
                    onPress={()=>TrackPlayer.skip(index)}
                    key={index.toString()}
                    title={item?.title}
                    description={item?.artist}
                    accessoryLeft={()=><MemoAvatar src={(item?.artwork as string)} />}
                    style={{paddingVertical:10,paddingHorizontal:5,...(current === index ? {backgroundColor:theme['background-basic-color-2']} : isActive ? {backgroundColor:theme['background-basic-color-3']} : {backgroundColor:theme['background-basic-color-1']})}} 
                    {...(current !== index ? {
                        accessoryRight:()=>(
                            <Pressable default onPressIn={drag}>
                                <DragIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
                            </Pressable>
                        )
                    } : {})}
                />
            )}
        </>
    )
}
export const QueueList = React.memo(RenderList)

const RenderQueue=({queueRef,queueAnim,qHandle}: MiniHeaderTypes)=>{
    const [data,setData] = React.useState<Track[]>([]);
    const {updated} = useSelector(state=>({updated:state.musicPlayerUpdate}));
    const {editQueue,removeQueue}=useTrackPlayer();

    React.useEffect(()=>{
        TrackPlayer.getQueue().then((a)=>{
            setData(a)
        })
    },[updated])

    const onPress=React.useCallback(()=>{
        if(!qHandle) {
            queueRef.current?.open("top")
            setTimeout(()=>{
                queueAnim.setValue(1)
            },100)
        }
    },[qHandle])

    const onDrag=React.useCallback(({data:dt,from,to}: {data:Track[],from:number,to:number})=>{
        if(from !== to) {
            setData(dt);
            const removed = data[from];
            editQueue(removed,from,to)
        }
    },[data])

    const onRemove=React.useCallback((track:number)=>{
        removeQueue(track)
        const dt = [...data];
        dt.splice(track,1);
        setData(dt)
    },[data])

    return(
        <>
            <Animated.View
                style={{
                    height:30,
                    margin:18,
                }}
            >
                <Pressable default onPress={onPress} style={{flexDirection:"row",justifyContent:'center'}}><Text category="h6">Up Next</Text></Pressable>
            </Animated.View>
            <Divider />

            <Draggable
                data={data}
                renderItem={(props)=><QueueList {...props} onRemove={onRemove} />}
                keyExtractor={(i,ii)=>`draggable_item_${i.id}_${ii}`}
                onDragEnd={onDrag}
            />
        </>
    )
}

export default React.memo(RenderQueue)