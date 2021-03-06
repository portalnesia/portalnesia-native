import React from 'react';
import { StyleSheet,BackHandler,ToastAndroid } from 'react-native';
import {TopNavigationProps,RenderBackBtn} from '../navigation/TopNav';
import {Layout as Lay,Text,useTheme} from '@ui-kitten/components'
import {useFocusEffect} from '@react-navigation/native'
import { useNavigationState } from '@react-navigation/core';
import {StackHeaderProps} from '@react-navigation/stack'
import Portalnesia from '@portalnesia/react-native-core'

export interface LayoutProps extends TopNavigationProps {
    children?: React.ReactNode
    custom?: (config: StackHeaderProps)=>React.ReactNode;
    forceEnable?:boolean;
    notAskExit?:boolean;
    left?:()=>React.ReactElement
}

/**
 * Portalnesia Parent Layout
 * 
 * @param props
 * @returns JSX.Element
 */
class LayoutClass extends React.PureComponent<LayoutProps> {
    constructor(props: LayoutProps){
        super(props);
    }

    static defaultProps={
        withBack:true,
        align:'center',
        canBack:true
    }

    render() {
        const {title,withClose,whiteBg,children,withBack,...rest} = this.props;
        return (
            <Lay style={styles.container} {...(whiteBg ? {level:"1"} : {level:"2"})}>
                {children}
            </Lay>
        )
    }
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
});

/**
 * Portalnesia Parent Layout
 * 
 * @param props
 * @returns JSX.Element
 */
let timeout: number|null=null;
export default function Layout(props: LayoutProps) {
    const {withBack=true,withClose,title,align,custom,navigation,subtitle,menu,notAskExit,left} = props;
    const {index,routeName} = useNavigationState(state=>{
        return {index:state.index,routeName:state.routes[0].name};
    })
    const theme = useTheme();
    const [wait,setWait] = React.useState(false);

    React.useEffect(()=>{
        if(wait) {
            timeout = (setTimeout(()=>setWait(false),1500) as unknown) as number;
        }
    },[wait])

    useFocusEffect(
		React.useCallback(()=>{
			const onBackPress=()=>{
				if(index==0 && routeName === "Home" && typeof notAskExit === 'undefined') {
                    if(!wait) {
                        ToastAndroid.show("Press again to exit",1000);
                        setWait(true)
                        return true;
                    } else {
                        if(timeout!==null) clearTimeout(timeout);
                        try {
                            Portalnesia.Core.exitApp();
                        } catch(e) {
                            console.log("ERROR",e);
                        }
                        
                        return true;
                    }
                }
                return false;
			}

			BackHandler.addEventListener("hardwareBackPress",onBackPress)

			return ()=>BackHandler.removeEventListener("hardwareBackPress",onBackPress)
		},[index,wait,routeName,notAskExit])
	)

    React.useLayoutEffect(()=>{
        navigation.setOptions({
            headerTitleAlign:align==='start' ? "left" : "center",
            ...(left ? {headerLeft:left} : withClose || withBack ? {headerLeft:()=><RenderBackBtn withClose={withClose} withBack={withBack} navigation={navigation} />} : {}),
            ...(menu ? {headerRight: menu} : {}),
            ...(typeof custom === 'function' ? {
                headerShown:true,
                header:custom
            } : typeof title !== 'undefined' ? {
                headerShown:true,
                headerTitle: ()=>{
                    if(typeof title !== 'string' && typeof title !== 'number') {
                        const Title = title;
                        return <Title />;
                    } else {
                        if(subtitle) {
                            return (
                                <>
                                    <Text category="h1" numberOfLines={1} style={{fontSize:17,textAlign:align==='start' ? "left" : "center"}}>{title}</Text>
                                    <Text category="label" numberOfLines={1} style={{color:theme['text-hint-color'],fontSize:13,textAlign:align==='start' ? "left" : "center"}}>{subtitle}</Text>
                                </>
                            )
                        } else {
                            return (
                                <Text category="h1" numberOfLines={1} style={{fontSize:18}}>{title}</Text>
                            )
                        }
                    }
                }
            } : {headerShown:false})
        })
    },[navigation,withBack,withClose,title,subtitle,align,custom,menu,left])

    return <LayoutClass {...props} />
}