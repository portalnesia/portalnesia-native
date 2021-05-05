import React from 'react'
import {Animated,Dimensions,View} from 'react-native'
import {Layout as Lay, Text,Divider,useTheme,Icon, List} from '@ui-kitten/components'
import Pressable from './Pressable'
import {Portal} from '@gorhom/portal'
import Modal from 'react-native-modal';
import i18n from 'i18n-js'
import {onLinkPagePress} from '@pn/components/global/Parser'
import ListItem from './ListItem'

const {width,height}=Dimensions.get('window')

const TableContentText=React.memo(({style,sticky,scrollAnim,translateY,onPress})=>{
    const theme = useTheme();
    if(sticky) {
        const translateScroll = Animated.add(
            scrollAnim.interpolate({
                inputRange:[0,120,220],
                outputRange:[-56,0,56],
                extrapolate:'clamp'
            }),
            translateY
        )
        return (
            <Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY:translateScroll}]}}>
                <Pressable onPress={()=>onPress && onPress()} style={{paddingVertical:10,paddingHorizontal:15,...style}}>
                    <Text>Table of Contents</Text>
                </Pressable>
                <Divider style={{backgroundColor:theme['border-text-color']}} />
            </Animated.View>
        )
    }
    return (
        <Pressable onPress={()=>onPress && onPress()} style={{paddingVertical:10,paddingHorizontal:15,...style}}>
            <Text>Table of Contents</Text>
        </Pressable>
    )
})

const RenderList = React.memo(({item,index,onPress})=>{
    const theme=useTheme()
    const margin = item?.tag == 'h3' ? 0 : item?.tag == 'h4' ? 10 : 20;
    const renderTitle = (props)=>(
        <View style={{alignItems:'flex-start',flexDirection:'row',justifyContent:'flex-start',marginLeft:margin}}>
            <View
                style={{
                    width: 13 / 2.8,
                    height: 13 / 2.8,
                    marginTop: 13 / 1.5,
                    borderRadius: 13 / 2.8,
                    backgroundColor: theme['text-basic-color'],
                }}
            />
            <Text {...props}>{item?.name}</Text>
        </View>
    )

    return (
        <Lay>
            <ListItem 
                key={index} 
                title={renderTitle}
                onPress={()=>onPress(item?.id)}
            />
        </Lay>
    )
})

const TableContentModal = React.memo(({open=false,content=[],onClose,yLayout,scrollRef})=>{
    const theme = useTheme();

    const onPress=React.useCallback((id)=>{
        onClose();
        onLinkPagePress(id,yLayout,scrollRef)
    },[yLayout,scrollRef,onClose])

    const DataContent=React.useMemo(()=>{
        return content.filter(i=>i?.name && i?.name?.match(/\S/) !==null)
    },[content])

    return (
        <Portal>
            <Modal
                isVisible={open}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
                coverScreen={false}
            >
                <Lay style={{padding:10,width:width-20,borderRadius:10}}>
                    <Lay style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Text>{i18n.t("table_of_content")}</Text>
                        <Lay style={{borderRadius:22,overflow:'hidden'}}>
                            <Pressable style={{padding:10}} onPress={()=> onClose && onClose()}>
                                <Icon style={{width:24,height:24,tintColor:theme['text-hint-color']}} name="close-outline" />
                            </Pressable>
                        </Lay>
                    </Lay>
                    <Divider style={{marginVertical:5,backgroundColor:theme['border-text-color']}} />
                    <Lay style={{maxHeight:height-125}}>
                        <List
                            data={DataContent}
                            renderItem={(props)=><RenderList {...props} onPress={onPress} />}
                            keyExtractor={(item,index)=>item.id}
                            ItemSeparatorComponent={Divider}
                        />
                    </Lay>
                </Lay>
            </Modal>
        </Portal>
    )
})

export default {
    Text:TableContentText,
    Modal:TableContentModal
}