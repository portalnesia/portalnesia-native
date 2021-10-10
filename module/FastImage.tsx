import Pressable from '@pn/components/global/Pressable';
import React from 'react';
import { View,Image,NativeModules,requireNativeComponent,StyleSheet,FlexStyle,LayoutChangeEvent,ShadowStyleIOS,StyleProp,TransformsStyle,AccessibilityProps } from 'react-native';

const FastNativeModule = NativeModules.PNImageView;

export type ResizeMode = 'contain'|'cover'|'stretch'|'center';
export type Priority = 'low'|'normal'|'high';
type Cache = 'immutable'|'web'|'cacheOnly';

export type Source = {
    uri?:string,
    headers?:Record<string,string>,
    priority?: Priority,
    cache?: Cache,
    thumbnail?: string
}

export interface OnLoadEvent {
    nativeEvent:{
        width:number,
        height:number
    }
}
export interface OnProgressEvent {
    nativeEvent:{
        loaded:number,
        total:number
    }
}
export interface ImageStyle extends FlexStyle {
    backfaceVisibility?:'visible'|'hidden';
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    backgroundColor?: string;
    borderColor?:string;
    borderWidth?: number;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    overlayColor?:string;
    tintColor?: string;
    opacity?: number;
}

export interface FastImageProps extends AccessibilityProps {
    source: Source|number;
    dataSrc?:Source|number;
    resizeMode?:ResizeMode;
    fallback?: boolean;
    onLoadStart?(): void;
    onProgress?(event: OnProgressEvent):void;
    onLoad?(event: OnLoadEvent):void;
    onError?():void;
    onLoadEnd?():void;
    onDismiss?():void;
    onOpen?():void;
    onLayout?(event: LayoutChangeEvent):void;
    style?: StyleProp<ImageStyle>;
    tintColor?:number|string;
    testID?:string;
    children?: React.ReactNode;
    viewRef?: React.Ref<View>;
}

class FastImage extends React.PureComponent<FastImageProps> {
    constructor(props: FastImageProps) {
        super(props);

    }
    static resizeMode = {
        contain:"contain",
        cover:"cover",
        stretch:"stretch",
        center:"center"
    }
    static priority = {
        low:"low",
        normal:"normal",
        high:"high"
    }
    static cacheControl = {
        immutable:"immutable",
        web:"web",
        cacheOnly:"cacheOnly"
    }
    
    static preload = function(source: Source[]){
        FastNativeModule.preload(source);
    }

    static clearMemoryCache = async function() {
        await FastNativeModule.clearMemoryCache();
    }

    static clearDiskCache = async function() {
        await FastNativeModule.clearDiskCache();
    }

    render() {
        const {source,dataSrc,tintColor,onLoad,onLoadEnd,onLoadStart,onError,onProgress,onDismiss,onOpen,style,fallback,resizeMode='cover',viewRef,children,...props} = this.props;

        if(fallback) {
            const cleanedSource = {...(source as any)}
            delete cleanedSource.cache;
            const resolveSource = Image.resolveAssetSource(cleanedSource);

            return (
                <View style={[styles.imageContainer,style]} ref={viewRef}>
                    <Image
                        {...props}
                        style={StyleSheet.absoluteFill}
                        source={resolveSource}
                        onLoad={onLoad as any}
                        onLoadStart={onLoadStart}
                        onProgress={onProgress}
                        onLoadEnd={onLoadEnd}
                        onError={onError}
                        resizeMode={resizeMode}
                    />
                    {children}
                </View>
            )
        } else {
            const resolveSource = Image.resolveAssetSource(source as any);
            const resolveDataSrc = dataSrc ? Image.resolveAssetSource(dataSrc as any) : undefined;
            
            return (
                <View style={[styles.imageContainer,style]} ref={viewRef}>
                    <FastImageNative
                        {...props}
                        tintColor={tintColor}
                        style={StyleSheet.absoluteFill}
                        source={resolveSource}
                        dataSrc={resolveDataSrc}
                        resizeMode={resizeMode}
                        onPNImageLoad={onLoad}
                        onPNImageLoadStart={onLoadStart}
                        onPNImageLoadEnd={onLoadEnd}
                        onPNImageProgress={onProgress}
                        onPNImageError={onError}
                        onPNImageDismiss={onDismiss}
                        onPNImageOpen={onOpen}
                    />
                    {children}
                </View>
            )
            
        }
    }
}

const styles = StyleSheet.create({
    imageContainer:{
        overflow:"hidden",
    }
})

const FastImageNative = (requireNativeComponent as any)(
    'PNImageView',
    FastImage,
    {
        nativeOnly:{
            onPNImageLoadStart:true,
            onPNImageProgress:true,
            onPNImageLoad:true,
            onPNImageError:true,
            onPNImageLoadEnd:true
        }       
    }
)
export default FastImage;