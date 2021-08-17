import React from 'react';
import { StyleSheet,BackHandler,ToastAndroid } from 'react-native';
import TopNav,{TopNavigationProps} from '../navigation/TopNav';
import {Layout as Lay} from '@ui-kitten/components'
import {useFocusEffect} from '@react-navigation/native'
import { useNavigationState } from '@react-navigation/core';

export interface LayoutProps extends TopNavigationProps {
    children?: React.ReactNode
    custom?: React.ReactNode;
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
        const {custom,title,withClose,whiteBg,children,withBack,...rest} = this.props;
        return (
            <Lay style={styles.container} {...(whiteBg ? {level:"1"} : {level:"2"})}>
                {custom ? custom : title || withClose ? (
                    <TopNav
                        title={title}
                        withBack={withBack ? true : false}
                        withClose={withClose}
                        whiteBg={whiteBg}
                        {...rest}
                    />
                ) : null}
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
export default function Layout(props: LayoutProps) {
    const {index,routeName} = useNavigationState(state=>{
        return {index:state.index,routeName:state.routes[0].name};
    })
    const [wait,setWait] = React.useState(false);

    React.useEffect(()=>{
        if(wait) {
            setTimeout(()=>setWait(false),1500);
        }
    },[wait])

    useFocusEffect(
		React.useCallback(()=>{
			const onBackPress=()=>{
				if(index==0 && routeName === "Home") {
                    if(!wait) {
                        ToastAndroid.show("Press again to exit",1000);
                        setWait(true)
                        return true;
                    }
                }
                return false;
			}

			BackHandler.addEventListener("hardwareBackPress",onBackPress)

			return ()=>BackHandler.removeEventListener("hardwareBackPress",onBackPress)
		},[index,wait,routeName])
	)

    return <LayoutClass {...props} />
}