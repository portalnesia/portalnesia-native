import React from 'react'
import {getActionFromState,getPathFromState,getStateFromPath,StackActions} from '@react-navigation/native'
import {linking} from './Linking'

export const navigationRef = React.createRef();

const dispatch = (action)=>{
    navigationRef?.current?.dispatch(action);
}

const reset = (state)=>{
    navigationRef?.current?.reset(state);
}

export const getPath=()=>{
    const state = navigationRef?.current?.dangerouslyGetState();
    if(state !== undefined) return getPathFromState(state)
    return "";
}

export const linkTo=(path,push=false)=>{
    const state = getStateFromPath(path,linking.config)
    if(state) {
        const action = getActionFromState(state);
        if(action !== undefined) {
            dispatch(action);
        } else {
            reset(state)
        }
    }
}

export const getActionLink=(path)=>{
    const state = getStateFromPath(path,linking.config)
    if(state) {
        return getActionFromState(state);
    }
    return undefined;
}

export default useRootNavigation=()=>({navigationRef,linkTo})