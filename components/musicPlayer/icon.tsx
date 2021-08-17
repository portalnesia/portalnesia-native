import React from 'react'
import {ImageProps} from 'react-native'
import {Icon} from '@ui-kitten/components'

export const PlayIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="play" pack="font_awesome" style={[props?.style]} />
export const PauseIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="pause" pack="font_awesome" style={[props?.style]} />
export const NextIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="skip-next" pack="material" style={[props?.style]} />
export const PrevIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="skip-previous" pack="material" style={[props?.style]} />
export const DownIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="arrow-ios-downward" style={[props?.style]} />
export const CloseIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="close" style={[props?.style]} />
export const DragIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="drag-handle" pack="material" style={[props?.style]} />
export const VolumeOffIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="volume-off" style={[props?.style]} />
export const VolumeOnIcon=(props?:Partial<ImageProps>) => <Icon {...props} name="volume-up" style={[props?.style]} />