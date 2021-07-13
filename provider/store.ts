import {createStore,applyMiddleware,Store} from 'redux'
import thunk from 'redux-thunk'
import {ReduxState,ReduxAction,DispatchType} from './types'
import reducer from './reducer';

const store: Store<ReduxState,ReduxAction> & {dispatch: DispatchType} = createStore(reducer,applyMiddleware(thunk))

export default store;