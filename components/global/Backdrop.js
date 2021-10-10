import React from 'react';
import {  View,Animated,StyleSheet,Easing,useWindowDimensions } from 'react-native';
import {useTheme,Text} from '@ui-kitten/components'
import Modal from 'react-native-modal'
import Spinner from '@pn/components/global/Spinner'
import Button from '@pn/components/global/Button'
import I18n from 'i18n-js';

const LoadingBackdrop=({visible,onClose,text,theme,width,onCancel})=>(
    <Modal
        isVisible={visible||false}
        style={{margin:0,justifyContent:'center'}}
        onBackdropPress={onClose}
        animationIn="fadeIn"
        animationOut="fadeOut"
        coverScreen={false}
    >
        <View style={{maxWidth:width-20,margin:10,paddingVertical:20,paddingHorizontal:20,backgroundColor:theme['background-basic-color-1'],borderRadius:10}}>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                <Text style={{marginBottom:30,fontSize:18}}>{text}</Text>
                <Spinner size="large" />
            </View>

            {onCancel && (
                <View style={{marginTop:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <Button text onPress={onCancel}><Text style={{fontSize:15,color:theme['text-hint-color']}}>{I18n.t("cancel")}</Text></Button>
                </View>
            )}
        </View>
    </Modal>
)

function Backdrop({progress,visible,onClose,loading,text="Loading...",onCancel}){
    const theme = useTheme();
    const {width} = useWindowDimensions()
    const [scale,setScale]=React.useState(0);
    
    React.useEffect(()=>{
        setScale(Math.floor(progress))
    },[progress])

    if(loading) return <LoadingBackdrop onCancel={onCancel} visible={visible} onClose={onClose} text={text} theme={theme} width={width} />

    return (
        <Modal
            isVisible={visible||false}
            style={{margin:0,justifyContent:'center'}}
            onBackdropPress={onClose}
            animationIn="fadeIn"
            animationOut="fadeOut"
        >
            <View style={{width:width-20,margin:10,paddingVertical:20,paddingHorizontal:10,backgroundColor:theme['background-basic-color-1'],borderRadius:10}}>
                <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{marginBottom:30,fontSize:18}}>{text}</Text>
                    <View style={{flexDirection:'row',height:15,width:'100%',backgroundColor:theme['background-basic-color-3'],borderColor:theme['border-basic-color'],borderWidth:2,borderRadius:15}}>
                        <Animated.View style={[StyleSheet.absoluteFill,{backgroundColor:theme['color-indicator-bar'],width:`${scale}%`,borderRadius:15}]} />
                    </View>
                    <Text style={{marginTop:10}}>{`${scale}%`}</Text>
                </View>
                {onCancel && (
                    <View style={{marginTop:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <Button text onPress={onCancel}><Text style={{fontSize:15,color:theme['text-hint-color']}}>{I18n.t("cancel")}</Text></Button>
                    </View>
                )}
            </View>
        </Modal>
    )
}
export default React.memo(Backdrop);