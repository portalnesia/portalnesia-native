import React from 'react'
import {Dimensions,Animated,View} from 'react-native'
import {Modalize} from 'react-native-modalize'
import {useTheme} from '@ui-kitten/components'
import {addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener,EventType,getInitialURL} from 'expo-linking'
import {setStatusBarBackgroundColor} from 'expo-status-bar'
import {useSelector,useDispatch} from '@pn/provider/actions'
import MiniHeader from './MiniHeader'
import Player from './Player'
import Queue from './Queue'
import useTrackPlayer from './Action'

const {height:winHeight,width:winWidth} = Dimensions.get("window");
const modalRef = React.createRef<Modalize>();
const queueRef = React.createRef<Modalize>();

function MusicPlayer() {
    const track = useSelector(state=>state.musicPlayer);
    const theme = useTheme();
    const [handle,setHandle]=React.useState(false);
    const [qHandle,setQHandle]=React.useState(false);

    const animated = React.useRef(new Animated.Value(0)).current;
    const queueAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(()=>{
        if(track) modalRef.current?.open("default");
        else modalRef.current?.close("default");
    },[track])

    const onPositionChange=React.useCallback((position)=>{
        setHandle(position==='top')
        if(position!=='top') {
            setStatusBarBackgroundColor(theme['background-basic-color-1'],true)
            queueRef.current?.close("alwaysOpen")
        } else {
            setStatusBarBackgroundColor(theme['background-basic-color-2'],true)
        }
    },[])
    const onQPositionChange=React.useCallback((position)=>{
        setQHandle(position==='top')
    },[])

    React.useEffect(()=>{
        function handleURL({url}: EventType){
            if(url === "trackplayer://notification.click") {
                if(track) {
                    modalRef.current?.open("top");
                    setTimeout(()=>{
                        animated.setValue(1)
                    },500)
                }
            }
		}
        async function getInitialLink() {
			const url = await getInitialURL();
			if(typeof url === 'string') {
				if(url === "trackplayer://notification.click") {
					if(track) {
                        setTimeout(()=>{
                            modalRef.current?.open("top");
                        },300)
                        setTimeout(()=>{
                            animated.setValue(1)
                        },800)
                    }
				}
			}
		}
        getInitialLink();
        ExpoAddListener('url',handleURL)
        return ()=>{
            ExpoRemoveListener('url',handleURL);
        }
    },[track])

    return (
        <>
        <Modalize
            ref={modalRef}
            withHandle={false}
            modalStyle={{
                backgroundColor:handle ? theme['background-basic-color-2'] : theme['background-basic-color-1'],
                borderTopLeftRadius:0,
                borderTopRightRadius:0,
            }}
            modalHeight={winHeight}
            panGestureAnimatedValue={animated}
            alwaysOpen={80}
            withOverlay={false}
            onPositionChange={onPositionChange}
            disableScrollIfPossible
            scrollViewProps={{scrollEnabled:false}}
            //handlePosition="inside"
            //handleStyle={{top:13,width:40,height: handle ? 6 : 0,backgroundColor:theme['text-hint-color']}}
        >
            <View style={{height:winHeight-33}}>
                <MiniHeader animated={animated} modalRef={modalRef} handle={handle} qHandle={qHandle} queueRef={queueRef} queueAnim={queueAnim} />
                <Player animated={animated} modalRef={modalRef} handle={handle} qHandle={qHandle} queueRef={queueRef} queueAnim={queueAnim} />
                
            </View>
            <Modalize
                ref={queueRef}
                alwaysOpen={60}
                withHandle={false}
                withOverlay={false}
                tapGestureEnabled
                panGestureAnimatedValue={queueAnim}
                modalHeight={winHeight-110}
                onPositionChange={onQPositionChange}
                modalStyle={{
                    backgroundColor:theme['background-basic-color-1'],
                    borderTopLeftRadius:0,
                    borderTopRightRadius:0,
                    elevation:qHandle ? 0 : 4
                }}
            >
                <Queue animated={animated} modalRef={modalRef} handle={handle} qHandle={qHandle} queueRef={queueRef} queueAnim={queueAnim} />
            </Modalize>
        </Modalize>
        </>
    )
}

export default React.memo(MusicPlayer);