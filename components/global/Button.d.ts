import React from 'react'
import {ButtonProps as BtnProps,Button as Btn} from '@ui-kitten/components'

export interface ButtonProps extends BtnProps {
    outlined?: boolean;
    loading?: boolean;
    text?: boolean;
    tooltip?: string;
}

declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<Btn>>
export default Button