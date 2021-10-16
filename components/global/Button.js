import React from 'react'
import {Button as Btn,useTheme} from '@ui-kitten/components'
import {View,Pressable} from 'react-native'
import withTooltip from '../HOC/withTooltip'
import Spinner from '@pn/components/global/Spinner'

export const LoadingComponent=React.memo((props)=>(
    <View style={[props.style,{justifyContent:'center',alignItems:'center'}]}>
        <Spinner />
    </View>
))

const Button=React.forwardRef(({size,onPress,onLongPress,disabled,loading,status,appearance,outlined,children,text,accessoryLeft: accessLeft,accessoryRight: accessRight,...others},ref)=>{
    const stat = React.useMemo(()=>(outlined ? "basic" : text ? "basic" : status),[outlined,text,status]);
    const appear = React.useMemo(()=>(outlined ? "outline" : text ? "ghost" : appearance),[outlined,text,appearance]);
    const theme = useTheme();
    
    const accessoryLeft = React.useCallback((props)=>{
        if(typeof children === 'undefined') {
            if(loading) return <LoadingComponent {...props} />
        }
        return accessLeft ? accessLeft(props) : null;
    },[loading,accessLeft,children])

    const accessoryRight=React.useCallback((props)=>{
        if(typeof children !== 'undefined') {
            if(loading) return <LoadingComponent {...props} />
        }
        return accessRight ? accessRight(props) : null;
    },[loading,accessRight,children])

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
const ButtonTooltip = withTooltip(Button);
export default React.memo(ButtonTooltip);