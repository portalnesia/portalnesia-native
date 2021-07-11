import React, { PureComponent } from 'react'
import { View, ViewStyle,Animated,PanResponder, PanResponderInstance, GestureResponderEvent, PanResponderGestureState,NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import {Layout} from '@ui-kitten/components'
import { AuthContext } from '@pn/provider/Context';
import LottieView from 'lottie-react-native';

interface PullToRefreshHeaderProps {
    pullDistance: number;
    percentAnimatedValue: Animated.AnimatedDivision;
    percent: number;
    refreshing: boolean;
}

export interface PullToRefreshProps {
    style?: ViewStyle;
    headerHeight: number;
    refreshingHoldHeight?: number;
    refreshing: boolean;
    onRefresh: () => void;
    children: JSX.Element;
    topPullThreshold?: number;
    scrollRef?: any;
}

interface State {
    containerTop: Animated.Value;
    scrollEnabled: boolean;
}

type HeaderState = {
    pullDistance: number,
    percent: number
}

interface HeaderClassProps extends PullToRefreshHeaderProps {
    theme: string
}

class HeaderClass extends React.PureComponent<HeaderClassProps,HeaderState> {
    lottie = React.createRef<LottieView>();

    constructor(props: HeaderClassProps) {
        super(props);
        this.state = {
            pullDistance:props.pullDistance,
            percent: props.percent
        }
    }

    componentDidUpdate(prevProps: HeaderClassProps) {
        if(prevProps.pullDistance !== this.props.pullDistance) {
            this.setState({pullDistance:this.props.pullDistance})
        }
        if(prevProps.percent !== this.props.percent) {
            this.setState({percent:this.props.percent})
        }
        if(!prevProps.refreshing && this.props.refreshing) {
            this.lottie.current?.play();
        }
        if(prevProps.refreshing && !this.props.refreshing) {
            this.lottie.current?.reset();
        }
    }

    setProgress({pullDistance,percent}: {pullDistance:number,percent:number}) {
        this.setState({
            pullDistance,
            percent
        })
    }

    render() {
        const {theme} = this.props;
        const {percent} = this.state
        const progress = (percent*0.35)
        return (
            <View style={{justifyContent:'center',alignItems: 'center'}}>
                <LottieView
                    ref={this.lottie}
                    style={{height:40,marginTop:10,marginBottom:30}}
                    progress={progress}
                    source={theme==='dark' ? require('@pn/assets/animation/spinner-dark.json') : require('@pn/assets/animation/spinner-light.json')}
                />
            </View>
        )
    }
}

const Header=React.forwardRef<HeaderClass,PullToRefreshHeaderProps>((props,ref)=>{
    const context = React.useContext(AuthContext);
    const {theme} = context;

    return <HeaderClass ref={ref} {...props} theme={theme} />
})

const refreshTriggerHeight = 100;
export default class PullRefresh extends PureComponent<PullToRefreshProps,State> {
    static defaultProps = {
        refreshing: false,
        topPullThreshold: 2,
    };
    containerTranslateY: number = 0;
    innerScrollTop: number = 0;
    _panResponder: PanResponderInstance;
    headerRef: any = null;
    scrollRef: any = null;

    constructor(props: PullToRefreshProps) {
        super(props);

        this.state = {
            containerTop: new Animated.Value(0),
            scrollEnabled: false,
        };

        this.state.containerTop.addListener(this.containerTopChange);

        this.onMoveShouldSetResponder = this.onMoveShouldSetResponder.bind(this);
        this.onResponderGrant = this.onResponderGrant.bind(this);
        this.onResponderReject = this.onResponderReject.bind(this);
        this.onPanResponderMove = this.onPanResponderMove.bind(this);
        this.onPanResponderRelease = this.onPanResponderRelease.bind(this);
        this.onPanResponderTerminate = this.onPanResponderTerminate.bind(this);
        this.onResponderTerminationRequest = this.onResponderTerminationRequest.bind(this);
        this.onScroll = this.onScroll.bind(this);

        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: this.onMoveShouldSetResponder,
            onPanResponderGrant: this.onResponderGrant,
            onPanResponderReject: this.onResponderReject,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderRelease,
            onPanResponderTerminationRequest: this.onResponderTerminationRequest,
            onPanResponderTerminate: this.onPanResponderTerminate,
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
              },
        });
    }

    updateInnerScrollRef = (ref: any) => {
        this.scrollRef = ref;
        if(this.props.scrollRef) this.props.scrollRef(ref)
    };

    onMoveShouldSetResponder(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (this.props.refreshing) {
            return false;
        }
        return !this.state.scrollEnabled;
    }

    onResponderGrant(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
    }

    onResponderReject(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
    }

    onPanResponderMove(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (gestureState.dy >= 0) {
            if(gestureState.dy < (refreshTriggerHeight + 10)) this.state.containerTop.setValue(gestureState.dy);
        } else {
            this.state.containerTop.setValue(0);
            if (this.scrollRef) {
                if (typeof this.scrollRef.scrollToOffset === 'function') {
                    this.scrollRef.scrollToOffset({
                        offset: -gestureState.dy,
                        animated: true,
                    });
                } else if(typeof this.scrollRef.scrollTo === 'function') {
                    this.scrollRef.scrollTo({
                        y: -gestureState.dy,
                        animated: true,
                    });
                }
            }
        }
    }

    onPanResponderRelease(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
        const threshold = refreshTriggerHeight;
        if (this.containerTranslateY >= threshold) {
            this.props.onRefresh();
        } else {
            this._resetContainerPosition();
        }
        this.checkScroll();
    }

    onResponderTerminationRequest(event: GestureResponderEvent): boolean {
        // console.log(`====== terminate request`);
        return false;
    }

    onPanResponderTerminate(event: GestureResponderEvent, gestureState: PanResponderGestureState) {
        this._resetContainerPosition();
        this.checkScroll();
    }

    _resetContainerPosition() {
        Animated.timing(this.state.containerTop, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }

    containerTopChange = ({ value }: { value: number }) => {
        this.containerTranslateY = value;
        if (this.headerRef) {
            this.headerRef.setProgress({
                pullDistance: value,
                percent: value / (refreshTriggerHeight),
            });
        }
    };

    onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        this.innerScrollTop = event.nativeEvent.contentOffset.y;
        this.checkScroll();
    };

    checkScroll = () => {
        if (this.isInnerScrollTop()) {
            if (this.state.scrollEnabled) {
                this.setState({
                    scrollEnabled: false,
                });
            }
        } else {
            if (!this.state.scrollEnabled) {
                this.setState({
                    scrollEnabled: true,
                });
            }
        }
    };

    isInnerScrollTop() {
        return this.innerScrollTop <= this.props.topPullThreshold;
    }

    componentDidUpdate(prevProps: Readonly<PullToRefreshProps>, prevState: Readonly<State>) {
        if (!prevProps.refreshing && this.props.refreshing) {
            const holdHeight = this.props.refreshingHoldHeight || refreshTriggerHeight;
            Animated.timing(this.state.containerTop, {
                toValue: holdHeight,
                duration: 150,
                useNativeDriver: true,
            }).start();
        } else if (prevProps.refreshing && !this.props.refreshing) {
            Animated.timing(this.state.containerTop, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }

    componentWillUnmount() {
        this.state.containerTop.removeAllListeners();
    }

    renderHeader() {
        const style = {
            left: 0,
            width: '100%',
            top: this.props.headerHeight,
            //transform: [{ translateY: this.state.containerTop }],
        };
        const percent = Animated.divide(this.state.containerTop, refreshTriggerHeight);
        
        return (
            <Animated.View style={[style,{position:"absolute"}]}>
                <Header
                    ref={(c: any) => { this.headerRef = c; }}
                    percentAnimatedValue={percent}
                    pullDistance={this.containerTranslateY}
                    percent={this.containerTranslateY / this.props.headerHeight}
                    refreshing={this.props.refreshing}
                />
            </Animated.View>
        );
    }

    render() {
        const child = React.cloneElement(this.props.children, {
            bounces: false,
            alwaysBounceVertical: false,
            scrollEnabled: this.state.scrollEnabled,
            ref: this.updateInnerScrollRef,
        });
        return (
            <Layout
                level="2"
                style={[this.props.style,{flex:1}]}
                {...this._panResponder.panHandlers}
            >
                {this.renderHeader()}
                <Animated.View style={[{ flex: 1, transform: [{ translateY: this.state.containerTop }] }]}>
                    {child}
                </Animated.View>
            </Layout>
        );
    }
}