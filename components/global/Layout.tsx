import React from 'react';
import { StyleSheet } from 'react-native';
import TopNav,{TopNavigationProps} from '../navigation/TopNav';
import {Layout as Lay} from '@ui-kitten/components'

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
 export default class Layout extends React.PureComponent<LayoutProps> {
    constructor(props: LayoutProps){
        super(props);
    }

    static defaultProps={
        title:undefined,
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