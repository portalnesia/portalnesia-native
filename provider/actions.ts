import {useSelector as useSelect,TypedUseSelectorHook } from 'react-redux'
import {ReduxState,ReduxAction, DispatchType} from './types'

export {useDispatch} from 'react-redux'

export function login(args: Pick<ReduxState,'user'|'session'|'token'>) {
    const action: ReduxAction = {
        type:"LOGIN",
        payload:args
    }
    return dispatchAction(action)
}

export function logout() {
    const action: ReduxAction = {
        type:"LOGOUT"
    }
    return dispatchAction(action)
}

export function changeTheme(theme:'light'|'dark',userTheme:'light'|'dark'|'auto'){
    const action: ReduxAction = {
        type:"THEME",
        payload:{
            theme,
            userTheme
        }
    }
    return dispatchAction(action)
}

export function changeLang(lang:'auto'|'id'|'en'){
    const action: ReduxAction = {
        type:"LANG",
        payload:lang
    }
    return dispatchAction(action)
}

export function dispatchAction(action:ReduxAction) {
    return (dispatch: DispatchType)=>{
        dispatch(action)
    }
}

export const useSelector: TypedUseSelectorHook<ReduxState> = useSelect;
export default useSelector;