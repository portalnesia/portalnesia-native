import React from 'react'
import {DeviceEventEmitter,StyleProp,ViewStyle,requireNativeComponent, EmitterSubscription, StyleSheet} from 'react-native'
import Authentication from '@pn/module/Authentication'
import PNGoogleSignInButton,{GoogleSignInButtonProps} from '@pn/module/PNGoogleSignInButton'

export type {GoogleSignInButtonProps} from '@pn/module/PNGoogleSignInButton'

class GoogleSignInButton extends React.PureComponent<GoogleSignInButtonProps> {
    private _clickListener: EmitterSubscription|undefined;

    constructor(props:GoogleSignInButtonProps) {
        super(props);
    }

    static Color = {
        AUTO:Authentication.BUTTON_COLOR_AUTO,
        LIGHT:Authentication.BUTTON_COLOR_LIGHT,
        DARK:Authentication.BUTTON_COLOR_DARK
    }
    static SIZE = {
        ICON:Authentication.BUTTON_SIZE_ICON,
        STANDARD:Authentication.BUTTON_SIZE_STANDARD,
        WIDE:Authentication.BUTTON_SIZE_WIDE
    }

    componentDidUpdate(prev: GoogleSignInButtonProps){
        if(prev.onPress !== this.props.onPress) {
            this._clickListener && this._clickListener.remove();
            this._clickListener = DeviceEventEmitter.addListener("PNGoogleSignInButtonClicked",()=>{
                this.props.onPress && this.props.onPress();
            })
        }
    }

    componentWillUnmount(){
        this._clickListener && this._clickListener.remove();
    }

    private getSize(){
        switch(this.props.size||GoogleSignInButton.SIZE.WIDE) {
            case GoogleSignInButton.SIZE.ICON:
                return style.iconSize;
            case GoogleSignInButton.SIZE.STANDARD:
                return style.standardSize;
            default:
                return style.wideSize;
        }
    }

    render() {
        const {style,...rest} = this.props;

        return <PNGoogleSignInButton style={[this.getSize(),style]} {...rest} />
    }
}

const style = StyleSheet.create({
    iconSize:{ width:48,height:48 },
    standardSize:{ width:212,height:48 },
    wideSize:{ width:312,height:48 }
})

export default GoogleSignInButton;