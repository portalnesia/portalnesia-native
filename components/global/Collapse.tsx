import React, { RefObject } from 'react'
import {Animated,View,ViewStyle,LayoutChangeEvent,Pressable,ScrollView, KeyboardAvoidingView} from 'react-native'
import {useTheme,Text,Icon} from '@ui-kitten/components'

interface IProps extends CollapseProps {
    theme: Record<string,string>,
}
type IState = {
    minHeight: number,
    maxHeight: number,
    visible: boolean
}


export type CollapseProps = {
    visible?:boolean,
    header: string | JSX.Element | JSX.Element[] ,
    children: React.ReactNode,
    containerStyle?: ViewStyle,
    addHeight?: number
    onClose?: ()=>void,
    onOpen?: ()=>void,
    position?:'top'|'bottom'
}

export class CollapseClass extends React.PureComponent<IProps,IState> {
    animation = new Animated.Value(54);

    constructor(props: IProps) {
        super(props)

        this.state={
            minHeight:0,
            maxHeight:1000000,
            visible: props.visible||false
        }
        this.toggle=this.toggle.bind(this);
        this.reset=this.reset.bind(this)
    }

    static defaultProps={
        position:'top'
    }

    reset(){
        //this.setState({maxHeight:100},()=>{
        //    setTimeout(()=>this.forceUpdate(),100);
        //})
    }

    componentDidUpdate(props:IProps,state: IState){
        if(props.visible !== this.props.visible) {
            this.toggle();
        }
    }

    toggle() {
        const {onClose,onOpen} = this.props
        const {minHeight,maxHeight,visible} = this.state;
        let finalValue = visible ? minHeight : maxHeight + minHeight
        this.setState({
            visible:!visible
        },()=>{
            if(onClose && visible) onClose();
            if(onOpen && !visible) onOpen();
            Animated.spring(this.animation,{
                toValue:finalValue,
                useNativeDriver:false
            }).start()
        })
    }
    _setMaxHeight(event: LayoutChangeEvent){
        const {addHeight} = this.props;
        const plus = addHeight||0
        const value = Math.round(event.nativeEvent.layout.height)+plus;
        console.log("MAX",value)
        this.setState({
            maxHeight: value
        })
    }
    _setMinHeight(event: LayoutChangeEvent){
        const value = Math.round(event.nativeEvent.layout.height);
        
        this.animation.setValue(value)
        this.setState({
            minHeight: value
        })
    }

    render(){
        const {header,children,theme,containerStyle,position} = this.props;
        const {maxHeight} = this.state

        /*const rotate = this.animation.interpolate({
            inputRange:[this.state.minHeight,this.state.maxHeight],
            outputRange:['0deg','180deg'],
            extrapolate:'clamp'
        })*/

        return (
            <Animated.View testID="Collapse" style={{...containerStyle,width:'100%',height:this.animation}}>
                {typeof header === 'string' ? (
                    <Pressable android_ripple={{color:'rgba(0, 0, 0, .32)',borderless:false}} onPress={()=>this.toggle()} onLayout={this._setMinHeight.bind(this)} >
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5,marginVertical:10}}>
                            <View>
                                <Text style={{paddingHorizontal:15}}>{header}</Text>
                            </View>
                            <Animated.View style={{marginRight:15}}>
                                {position ==='bottom' ? (
                                    <Icon name="arrow-ios-upward" style={{height:24,tintColor:theme['text-basic-color'],width:24}} />
                                ) : (
                                    <Icon name="arrow-ios-downward" style={{height:24,tintColor:theme['text-basic-color'],width:24}} />
                                )}
                            </Animated.View>
                        </View>
                    </Pressable>
                ) : (
                    <View onLayout={this._setMinHeight.bind(this)}>
                        {header}
                    </View>
                )}
                
                <View style={{paddingTop:10}} onLayout={this._setMaxHeight.bind(this)}>
                    {children}
                </View>
                
            </Animated.View>
        )
    }
}

const Collapse = React.forwardRef<CollapseClass,CollapseProps>((props,ref)=>{
    const theme = useTheme();
    return <CollapseClass ref={ref} {...props} theme={theme} />
})

export default Collapse