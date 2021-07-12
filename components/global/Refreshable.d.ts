import React from 'react'
import {ScrollView as SV,ScrollViewProps, ViewStyle,Animated} from 'react-native'

//type Constructor<T> = new (...args: any[]) => T;

export interface RefreshableProps extends ScrollViewProps {
    header?: React.ReactNode;
    refreshableTitlePull?: string;
    refreshableTitleRefreshing?: string;
    refreshableTitleRelease?: string;
    customRefreshView?: React.ReactNode;
    arrowImageStyle?: ViewStyle;
    refreshViewStyle?: ViewStyle;
    refreshViewHeight?: number,
    insideOfUltimateListView?: boolean;
    refreshing: boolean;
    onRefresh(): void
}

//declare class ScrollViewComponent extends React.Component<RefreshableProps> {}
//declare const SVBase: Constructor<SV> & typeof ScrollViewComponent;

declare class ScrollView extends React.PureComponent<RefreshableProps> {
    _offsetY: number;
    _isRefreshing: boolean;
    _dragFlag: boolean;
    renderRefreshHeader(): JSX.Element;
    renderSpinner(): JSX.Element;
    scrollTo(y?: number | { x?: number; y?: number; animated?: boolean }, x?: number, animated?: boolean): void;
    scrollToEnd(options?: { animated: boolean }): void;
}

//declare const ScrollView: React.ComponentClass<RefreshableProps>

export const Refreshable: Animated.AnimatedComponent<typeof ScrollView>;
export default ScrollView;