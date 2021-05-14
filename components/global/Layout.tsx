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
        align:'center'
    }

    render() {
        const props = this.props;
        return (
            <Lay style={styles.container} {...(props.whiteBg ? {level:"1"} : {level:"2"})}>
                {props.custom ? props.custom : props.title || props.withClose ? (
                    <TopNav
                        navigation={props.navigation}
                        title={props.title}
                        withBack={props.withBack ? true : false}
                        align={props.align}
                        subtitle={props.subtitle}
                        menu={props.menu}
                        withClose={props.withClose}
                        margin={props?.margin}
                        whiteBg={props.whiteBg}
                        withDivider={props.withDivider||true}
                    />
                ) : null}
                {props.children}
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