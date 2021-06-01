import React from 'react'
import {Layout as Lay, Text} from '@ui-kitten/components'
import {Animated,StyleSheet,View} from 'react-native'

export interface MeterProps {
    cents: number,
    theme: Record<string,string>
}

export default class Meter extends React.PureComponent<MeterProps> {
    private rotate: Animated.Value = new Animated.Value(0);
    constructor(props: MeterProps){
        super(props);
    }

    componentDidUpdate() {
        Animated.timing(this.rotate,{
            toValue:this.props.cents,
            useNativeDriver:true
        }).start();
    }

    render() {
        const cents = this.rotate.interpolate({
            inputRange:[-50,50],
            outputRange:["-45deg","45deg"]
        });

        return (
            <Lay style={{height:200,marginBottom:40}}>
                <View style={[style.origin,{backgroundColor:this.props.theme['color-indicator-bar']}]} />
                <Animated.View style={[style.scale,style.strong,style.pointer,{borderTopColor: this.props.theme['color-indicator-bar'],transform:[{rotate:cents}]}]} />
                
                <View style={[style.scale, style.scale_5, style.strong,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale_4,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale_3,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale_2,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale_1,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.strong,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale1,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale2,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale3,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale4,{borderTopColor: this.props.theme['text-basic-color']}]} />
                <View style={[style.scale, style.scale5, style.strong,{borderTopColor: this.props.theme['text-basic-color']}]} />
            </Lay>
        )
    }
}

const style = StyleSheet.create({
    meter: {
        height: 200,
        marginBottom: 40,
    },
    origin: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 10,
    },
    pointer: {
        borderTopWidth: 195,
    },
    strong: {
        width: 2,
        borderTopWidth: 20,
    },
    scale: {
        position: "absolute",
        left: 0,
        right: 0,
        width: 1,
        height: 400,
        borderTopWidth: 10,
        marginLeft: 4.5,
    },
    scale_1: {
        transform: [{ rotate: "-9deg" }],
    },
    scale_2: {
        transform: [{ rotate: "-18deg" }],
    },
    scale_3: {
        transform: [{ rotate: "-27deg" }],
    },
    scale_4: {
        transform: [{ rotate: "-36deg" }],
    },
    scale_5: {
        transform: [{ rotate: "-45deg" }],
    },
    scale1: {
        transform: [{ rotate: "9deg" }],
    },
    scale2: {
        transform: [{ rotate: "18deg" }],
    },
    scale3: {
        transform: [{ rotate: "27deg" }],
    },
    scale4: {
        transform: [{ rotate: "36deg" }],
    },
    scale5: {
        transform: [{ rotate: "45deg" }],
    },
})