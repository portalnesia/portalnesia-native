import React from 'react'
import {getActionFromState,getStateFromPath} from '@react-navigation/native'
import {linking} from './Linking'

export const navigationRef = React.createRef();

export const dispatch = (action)=>{
    navigationRef?.current?.dispatch(action);
}

export const linkTo=(path)=>{
    const state = getStateFromPath(path,linking.config)
    const action = getActionFromState(state);
    if(action !== undefined) {
        dispatch(action);
    }
}

export default useRootNavigation=()=>({navigationRef,linkTo})