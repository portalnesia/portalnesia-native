import {StyleProp,ViewStyle,requireNativeComponent} from 'react-native'

export interface GoogleSignInButtonProps  {
    style?:StyleProp<ViewStyle>;
    size?:number;
    color?:number;
    disabled?:boolean;
    onPress?:()=>void;
}

const PNGoogleSignInButton = requireNativeComponent<GoogleSignInButtonProps>("PNGoogleSignInButton");
export default PNGoogleSignInButton;