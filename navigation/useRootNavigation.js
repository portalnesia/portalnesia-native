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
    const state = navigationRef?.current?.getRootState();
    if(state !== undefined) return getPathFromState(state)
    return "";
}

export const resetRoot=()=>{
    const firstPath = getPath();
    const firstPathSplit = firstPath.split("/")[1];
    const state = navigationRef?.current?.getRootState();
    const routes=state?.routes?.map((dt)=>{
        if(dt?.name === firstPathSplit) {
            delete dt?.state;
        }
        return dt
    })
    navigationRef?.current?.resetRoot({
        index:0,
        routes
    })
}

const getRootPath=()=>{
    const firstPath = getPath();
    const uri = firstPath.split("?")[0];
    return uri.split("/")[1];
}

export const pushTo=(path,parseLink=true)=>{
    let finalPath;
    if(parseLink) {
        const index_of=['/','/chord','/news','/login-callback','/search'].indexOf(path);
        if(index_of !== -1) {
            const firstScreen=['HomeStack','ChordStack','NewsStack','MenuStack','SearchStack'];
            finalPath=`/${firstScreen[index_of]}${path}`;
        } else {
            const firstPathSplit = getRootPath();
            finalPath=`/${firstPathSplit}${path}`;
        }
    } else {
        finalPath=path;
    }
    
    const state = getStateFromPath(finalPath,linking.config)
    if(state) {
        const action = getActionFromState(state);
        if(action !== undefined) {
            const PushAction = StackActions.push(action?.payload?.params?.screen,action?.payload?.params?.params)
            dispatch(PushAction);
        } else {
            reset(state)
        }
    }
}

export const linkTo=(path,parseLink=true)=>{
    let finalPath;
    if(parseLink) {
        const index_of=['/','/chord','/news','/login-callback','/search'].indexOf(path);
        if(index_of !== -1) {
            const firstScreen=['HomeStack','ChordStack','NewsStack','MenuStack','SearchStack'];
            finalPath=`/${firstScreen[index_of]}${path}`;
        } else {
            const firstPathSplit = getRootPath();
            finalPath=`/${firstPathSplit}${path}`;
        }
    } else {
        finalPath=path;
    }
    const state = getStateFromPath(finalPath,linking.config)
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