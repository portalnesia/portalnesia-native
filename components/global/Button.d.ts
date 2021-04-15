import React from 'react'
import {ButtonProps as BtnProps} from '@ui-kitten/components'

export interface ButtonProps extends BtnProps {
    outlined?: boolean;
    loading?: boolean;
    text?: boolean;
}


export default function Button(props: ButtonProps): JSX.Element