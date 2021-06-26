import React from 'react'
import {StyleProp} from 'react-native'
import {Source,ImageStyle} from '@pn/module/FastImage'

export interface ImageFullInterface {
    source: Source|number;
    dataSrc?: Source|number;
    alt?: string;
    contentWidth?: number;
    imagesInitialDimensions?:{
        width:number,
        height:number
    };
    enableExperimentalPercentWidth?: boolean;
    computeImagesMaxWidth?(width:number):number;
    width?: number;
    height?:number;
    style?:StyleProp<ImageStyle>;
    thumbnail?: Source;
    zoomable?: boolean;
    onOpen?():void;
    onClose?():void;
    animated?:boolean;
    onPress?():void;
}

export default function ImageFull(props: ImageFullInterface): JSX.Element