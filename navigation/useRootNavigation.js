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
    const firstPathSplit = firstPath.split("/")[3];
    const state = navigationRef?.current?.getRootState();
    // PR
    //console.log(firstPathSplit,state?.routes?.[0]?.state?.routes?.[0]?.state?.routes);
    const routes=state?.routes?.map((dt,i)=>{
        if(dt?.state?.routes?.[0]?.name === "MainTab") {
            dt.state.routes[0].state.index=0;
            dt.state.routes[0].state.routes = dt?.state?.routes?.[0]?.state?.routes?.map((it,ii)=>{
                if(it?.name === firstPathSplit) {
                    delete it.state;
                }
                return it;
            })
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
    return uri.split("/")[3];
}

export const pushTo=(path,parseLink=true)=>{
    let finalPath;
    if(parseLink) {
        if(path?.match(/^(\/messages|\/support)/) !== null) {
            finalPath=`/MainStack/${path}`;
        } else {
            const index_of=['/','/chord','/news','/login-callback','/search'].indexOf(path);
            if(index_of !== -1) {
                const firstScreen=['HomeStack','ChordStack','NewsStack','MenuStack','SearchStack'];
                finalPath=`/MainStack/MainTab/${firstScreen[index_of]}${path}`;
            } else {
                const firstPathSplit = getRootPath();
                finalPath=`/MainStack/MainTab/${firstPathSplit}${path}`;
            }
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
        if(path?.match(/^(\/messages|\/support)/) !== null) {
            finalPath=`/MainStack/${path}`;
        } else {
            const index_of=['/','/chord','/news','/login-callback','/search'].indexOf(path);
            if(index_of !== -1) {
                const firstScreen=['HomeStack','ChordStack','NewsStack','MenuStack','SearchStack'];
                finalPath=`/MainStack/MainTab/${firstScreen[index_of]}${path}`;
            } else {
                const firstPathSplit = getRootPath();
                finalPath=`/MainStack/MainTab/${firstPathSplit}${path}`;
            }
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