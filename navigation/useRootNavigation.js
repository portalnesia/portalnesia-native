import React from 'react'
import {getActionFromState,getPathFromState,getStateFromPath,StackActions} from '@react-navigation/native'
import {linking} from './Linking'
import {openBrowser} from '@pn/utils/Main'
import {URL} from '@env'

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
    const routes=state?.routes?.map((dt)=>{
        /*const route = dt?.state?.routes?.map((r)=>{
            r.state.index=0;
            if(r?.state?.params) r.state.params=undefined;
            if(r?.params) r.params = undefined;

            if(r?.name === 'MainTab') {
                r.state.routes = r?.state?.routes?.map((it)=>{
                    if(it?.name === firstPathSplit) {
                        it.params=undefined;
                        delete it.state;
                    }
                    return it;
                })
                return r;
            } else {
                return undefined;
            }
        })

        dt.state.index=0;
        dt.params=undefined;
        if(typeof route?.[0] === 'object') {
            dt.state.routes=route;
            dt.state.params = undefined
        } else {
            delete dt.state;
        }*/
        dt.params=undefined;
        dt.state.index=0;
        if(dt?.state) delete dt.state;

        return dt;
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
                return linkTo(path);
                //const firstScreen=['HomeStack','ChordStack','NewsStack','MenuStack','SearchStack'];
                //finalPath=`/MainStack/MainTab/${firstScreen[index_of]}${path}`;
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
            const PushAction = StackActions.push(action?.payload?.params?.params?.params?.screen,action?.payload?.params?.params?.params?.params)
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

export const handleLinking=(url)=>{
    const link = getLink(url,false);
    if(link?.match(/\/corona+/) !== null) {
        openBrowser(link,false);
    } else {
        linkTo(link,false);
    }
}

export const getLink=(link,a=true)=>{
    if(link?.match(/\/corona+/) !== null) return `${URL}/corona`
    let url = link.replace(`${URL}/`,"");
    url = url.replace("pn://","");
    const uri = url.split("?")[0];
    const split = uri.split("/");
    let finalPath=''
    if(split?.[0] === 'user' && split?.[2] === 'edit') {
        finalPath = a ? `${URL}/MainStack/${uri}` : `/MainStack/${uri}`
    } else {
        let firstPath='';
        if(split[0] === 'news') firstPath='NewsStack';
        else if(split[0]==='chord') firstPath='ChordStack';
        else if(split[0]==='search') firstPath='SearchPath';
        else if(['pages','setting','contact','url','blog','twibbon','login-callback','twitter'].indexOf(split[0]) !== -1) firstPath='MenuStack';
        else firstPath="HomeStack";
        finalPath = a ? `${URL}/MainStack/MainTab/${firstPath}/${url}` : `/MainStack/MainTab/${firstPath}/${url}`
    }
    return finalPath;
}

export default useRootNavigation=()=>({navigationRef,linkTo})