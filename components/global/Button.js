import React from 'react'
import {Spinner,Button as Btn,useTheme} from '@ui-kitten/components'
import {View,Pressable} from 'react-native'
import withTooltip from '../HOC/withTooltip'

const LoadingComponent=React.memo((props)=>(
    <View style={[props.style,{justifyContent:'center',alignItems:'center'}]}>
        <Spinner size='small' />
    </View>
))

const Button=React.forwardRef(({size,onPress,onLongPress,disabled,loading,status,appearance,outlined,children,text,accessoryLeft: accessLeft,accessoryRight: accessRight,...others},ref)=>{
    const stat = outlined ? "basic" : text ? "basic" : status;
    const appear = outlined ? "outline" : text ? "ghost" : appearance;
    const theme = useTheme();
    
    const accessoryLeft = (props)=>{
        if(typeof children === 'undefined') {
            if(loading) return <LoadingComponent {...props} />
        }
        return accessLeft ? accessLeft(props) : null;
    }
    const accessoryRight=(props)=>{
        if(typeof children !== 'undefined') {
            if(loading) return <LoadingComponent {...props} />
        }
        return accessRight ? accessRight(props) : null;
    }

    if(text || (appearance==='ghost' && status==='basic')) {
        return (
            <View style={{borderRadius:4,overflow:'hidden'}}>
                <Pressable
                    disabled={disabled}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    ref={ref}
                    android_ripple={{color:theme['riple-color'],borderless:false}}
                >
                    <View pointerEvents="none">
                        <Btn
                            size={size}
                            status={stat}
                            appearance={appear}
                            disabled={disabled}
                            accessoryLeft={accessoryLeft}
                            accessoryRight={accessoryRight}
                            {...others}
                        >
                            {children}
                        </Btn>
                    </View>
                </Pressable>
            </View>
        )
    }
    return (
        <Btn
            size={size}
            status={stat}
            appearance={appear}
            disabled={disabled}
            accessoryLeft={accessoryLeft}
            accessoryRight={accessoryRight}
            onPress={onPress}
            onLongPress={onLongPress}
            ref={ref}
            {...others}
            
        >
            {children}
        </Btn>
    )
})

Button.defaultProps={
    size:'small',
    disabled:false,
    loading:false,
    status:'primary',
    appearance:'filled',
    outlined:false
}
export default withTooltip(Button)