import React from 'react'
import {Button as Btn} from '@ui-kitten/components'
import {Spinner} from '@ui-kitten/components'
import {View} from 'react-native'

const LoadingComponent=(props)=>(
    <View style={[props.style,{justifyContent:'center',alignItems:'center'}]}>
        <Spinner size='small' />
    </View>
)

const Button=({size,disabled,loading,status,appearance,outlined,children,...others})=>{
    const stat = outlined ? "basic" : status;
    const appear = outlined ? "outline" : appearance;

    return (
        <Btn
            size={size}
            status={stat}
            appearance={appear}
            disabled={disabled}
            {...(loading ? {accessoryRight:LoadingComponent} : {})}
            {...others}
        >
            {children}
        </Btn>
    )
}
Button.defaultProps={
    size:'small',
    disabled:false,
    loading:false,
    status:'primary',
    appearance:'filled',
    outlined:false
}
export default Button