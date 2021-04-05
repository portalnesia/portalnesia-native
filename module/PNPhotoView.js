import React from 'react'
import {requireNativeComponent} from 'react-native'
import Portalnesia from './PNModule'

const {
    PhotoView_ORIENTATION_0,
    PhotoView_ORIENTATION_90,
    PhotoView_ORIENTATION_180,
    PhotoView_ORIENTATION_270,
    PhotoView_ORIENTATION_USE_EXIF,
    PhotoView_PAN_LIMIT_INSIDE,
    PhotoView_PAN_LIMIT_CENTER,
    PhotoView_PAN_LIMIT_OUTSIDE,
    PhotoView_SCALE_TYPE_CENTER_INSIDE,
    PhotoView_SCALE_TYPE_CENTER_CROP,
    PhotoView_SCALE_TYPE_CUSTOM
} = Portalnesia.getConstants();

const PNPhotoView = requireNativeComponent("PNPhotoView");

export default class PhotoView extends React.PureComponent{
    static ORIENTATION_0 = PhotoView_ORIENTATION_0;
    static ORIENTATION_180 = PhotoView_ORIENTATION_180;
    static ORIENTATION_90 = PhotoView_ORIENTATION_90;
    static ORIENTATION_270 = PhotoView_ORIENTATION_270;
    static ORIENTATION_USE_EXIF = PhotoView_ORIENTATION_USE_EXIF
    static PAN_LIMIT_INSIDE = PhotoView_PAN_LIMIT_INSIDE;
    static PAN_LIMIT_CENTER = PhotoView_PAN_LIMIT_CENTER
    static PAN_LIMIT_OUTSIDE = PhotoView_PAN_LIMIT_OUTSIDE
    static SCALE_TYPE_CENTER_INSIDE = PhotoView_SCALE_TYPE_CENTER_INSIDE
    static SCALE_TYPE_CENTER_CROP = PhotoView_SCALE_TYPE_CENTER_CROP;
    static SCALE_TYPE_CUSTOM = PhotoView_SCALE_TYPE_CUSTOM;

    constructor(props){
        super(props)
        this._onReady=this._onReady.bind(this)
    }

    _onReady(event){
        const {onReady}=this.props;
        console.log(event)
        if(!onReady) return;
        onReady(event);
    }

    render(){
        const {onReady,src,...other} = this.props;
        return (
            <PNPhotoView {...other} src={src} onReady={this._onReady} />
        )
    }
}