import React from 'react';
import {useTheme} from '@ui-kitten/components'
import {StatusBar} from 'expo-status-bar'

interface BaseNavigatorInterface {
    children:React.ReactNode;
    tema: string;
    selectedTheme: string;
    lang: string;
}
function BaseNavigator({children,selectedTheme}: BaseNavigatorInterface){
    const theme=useTheme();
    return (
        <>
            <StatusBar animated style={(selectedTheme==='light' ? "dark" : "light")} translucent backgroundColor={theme['background-basic-color-1']} />
            {children}
        </>
    )
}
export default React.memo(BaseNavigator);