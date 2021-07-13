import React from 'react'
import {AuthProvider} from './provider/AuthProvider';
import store from '@pn/provider/store'
import {Provider} from 'react-redux'

export default function App() {
    return (
        <Provider store={store}>
            <AuthProvider />
        </Provider>
    )
}