import React from 'react';
import {AppState,AppStateStatus} from 'react-native'

export default function useAppState(): [AppStateStatus,AppStateStatus] {
    const  appState=React.useRef(AppState.currentState);
    const current = React.useRef(AppState.currentState)
    const [state,setState] = React.useState<[AppStateStatus,AppStateStatus]>([AppState.currentState,AppState.currentState])

    React.useEffect(()=>{
        function _onChange(nextState: AppStateStatus){
            current.current = appState.current;
            appState.current = nextState
            setState([nextState,current.current])
        }

        AppState.addEventListener('change',_onChange)

        return ()=>{
            AppState.removeEventListener('change',_onChange)
        }
    },[])

    return state;
}