import {useState,useCallback, memo} from 'react'

export default function useForceUpdate(){
    const [,dispatch] = useState<{}>(Object.create(null));

    const memoDispatch = useCallback(()=> dispatch(Object.create(null)),[dispatch])
    return memoDispatch
}