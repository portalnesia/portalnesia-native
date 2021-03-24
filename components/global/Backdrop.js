import React from 'react';
import {  View,Animated,StyleSheet,Easing,useWindowDimensions } from 'react-native';
import {useTheme,Text,Spinner} from '@ui-kitten/components'
import Modal from 'react-native-modal'

const LoadingBackdrop=({visible,onClose,text,theme,width})=>(
    <Modal
        isVisible={visible||false}
        style={{margin:0,justifyContent:'center'}}
        onBackdropPress={onClose}
    >
        <View style={{maxWidth:width-20,flexDirection:'column',justifyContent:'center',alignItems:'center',margin:10,paddingVertical:20,paddingHorizontal:10,backgroundColor:theme['background-basic-color-1'],borderRadius:10}}>
            <Text style={{marginBottom:10}}>{text}</Text>
            <Spinner size="giant" />
        </View>
    </Modal>
)

export default function Backdrop({progress,visible,onClose,loading,text="Loading..."}){
    const theme = useTheme();
    const {width} = useWindowDimensions()
    if(loading) return <LoadingBackdrop visible={visible} onClose={onClose} text={text} theme={theme} width={width} />
    
    const animation = React.useRef(new Animated.Value(0));
    const [scale,setScale]=React.useState(0);
    
    React.useEffect(()=>{
        Animated.timing(animation.current,{
            toValue:progress,
            duration:100,
            useNativeDriver:true,
        }).start()
    },[progress])

    React.useEffect(()=>{
        animation.current.addListener(({value})=>{
            setScale(Math.floor(value))
        })
        return ()=>animation.current.removeAllListeners();
    },[])

    return (
        <Modal
            isVisible={visible||false}
            style={{margin:0,justifyContent:'center'}}
            onBackdropPress={onClose}
        >
            <View style={{width:width-20,flexDirection:'column',justifyContent:'center',alignItems:'center',margin:10,paddingVertical:20,paddingHorizontal:10,backgroundColor:theme['background-basic-color-1'],borderRadius:10}}>
                <Text style={{marginBottom:10}}>{text}</Text>
                <View style={{flexDirection:'row',height:15,width:'100%',backgroundColor:theme['background-basic-color-3'],borderColor:theme['border-basic-color'],borderWidth:2,borderRadius:15}}>
                    <Animated.View style={[StyleSheet.absoluteFill,{backgroundColor:theme['color-indicator-bar'],width:`${scale}%`,borderRadius:15}]} />
                </View>
                <Text style={{marginTop:10}}>{`${scale}%`}</Text>
            </View>
        </Modal>
    )
}