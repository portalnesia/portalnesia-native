import React from 'react'
import {Modalize} from 'react-native-modalize'
import {Animated} from 'react-native'

export type MiniHeaderTypes={
    animated:Animated.Value,
    queueAnim:Animated.Value,
    modalRef: React.RefObject<Modalize>,
    handle:boolean,
    qHandle:boolean,
    queueRef: React.RefObject<Modalize>,
}