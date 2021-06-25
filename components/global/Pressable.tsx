import React from 'react'
import {Pressable as Presss, PressableProps as PresssProps,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import withTooltip from '../HOC/withTooltip'

export interface PressableProps extends PresssProps {
    default?: boolean
    borderless?: boolean
}

const CustomPressable=React.forwardRef<InstanceType<typeof View>,PressableProps>((props: PressableProps,ref)=>{
    const theme = useTheme();
    return <Presss ref={ref} {...props} {...(props.default ? {} : {android_ripple:{color:theme['riple-color'],borderless:(props.borderless||false)}})} />
})
const PressableTooltip = withTooltip(CustomPressable);
const Pressable = React.memo(PressableTooltip);
export default Pressable;