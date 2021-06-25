import React from 'react'
import {useWindowDimensions,View,StyleProp, StyleSheet} from 'react-native'
import ImageFullComp from './ImageFull'
import Img,{Source,ImageStyle} from '@pn/module/FastImage'

export interface ImageInterface {
    source: Source|number;
    dataSrc?: Source|number;
    style?: StyleProp<ImageStyle>;
    alt?: string;
    contentWidth?: number;
    fancybox?: boolean;
    forceFancybox?: boolean;
    thumbnail?: Source;
    zoomable?: boolean;
    onOpen?():void;
    onClose?():void;
    animated?:boolean;
    fullSize?:boolean;
}

const styles = StyleSheet.create({
    image:{
        backgroundColor:"transparent"
    }
})

function ImageFullComponent(props: ImageInterface){
    const {source,alt,contentWidth,fancybox,dataSrc,forceFancybox,onOpen,onClose,style}=props;
    const {width: screenWidth} = useWindowDimensions()

    React.useEffect(()=>{
        if(typeof dataSrc !== 'number' && dataSrc?.uri) {
            Img.preload([
                {uri:dataSrc.uri}
            ])
        }
    },[dataSrc])

    return (
        <ImageFullComp
            contentWidth={contentWidth||screenWidth}
            source={source}
            alt={alt}
            imagesInitialDimensions={{
                width:300,
                height:300
            }}
            onOpen={onOpen}
            onClose={onClose}
            animated={false}
            style={[styles.image,style]}
            {...(fancybox || forceFancybox ? {dataSrc:dataSrc||source}:{})}
        />
    )
}

export const ImageFull = React.memo(ImageFullComponent)

const ImageRef=React.forwardRef<View,ImageInterface>((props,ref)=>{
    const {source,alt,contentWidth,fancybox,dataSrc,forceFancybox,onOpen,onClose,fullSize,style}=props;
    const {width: screenWidth} = useWindowDimensions()

    React.useEffect(()=>{
        if(typeof dataSrc !== 'number' && dataSrc?.uri) {
            Img.preload([
                {uri:dataSrc.uri}
            ])
        }
    },[dataSrc])

    const ImageComponent=React.useCallback(()=>{
        if(fullSize) {
            return (
                <ImageFullComp
                    contentWidth={contentWidth||screenWidth}
                    source={source}
                    alt={alt}
                    imagesInitialDimensions={{
                        width:300,
                        height:300
                    }}
                    onOpen={onOpen}
                    onClose={onClose}
                    animated={false}
                    style={[styles.image,style]}
                    {...(fancybox || forceFancybox ? {dataSrc:dataSrc||source}:{})}
                />
            )
        } else {
            return <Img viewRef={ref} source={source} style={[styles.image,style]} onOpen={onOpen} onDismiss={onClose} {...(fancybox || forceFancybox ? {dataSrc:dataSrc||source}:{})} />
        }
    },[fullSize,contentWidth,source,style,alt,screenWidth,fancybox,dataSrc,forceFancybox])

    return <ImageComponent />
})

const Image = React.memo(ImageRef);
export default Image;