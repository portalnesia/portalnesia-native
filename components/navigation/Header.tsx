import React from 'react';
import {Divider} from '@ui-kitten/components'
import {Animated,NativeScrollEvent,NativeSyntheticEvent} from 'react-native'
import {useNavigationState} from '@react-navigation/native'
import {AuthContext} from '@pn/provider/Context'
import LottieView,{AnimatedLottieViewProps} from 'lottie-react-native'
import TopNavigationAction from './TopAction'
import TopNav,{TopNavigationProps} from './TopNav';

export interface HeaderProps extends TopNavigationProps {
    children?: React.ReactNode
    height?: number
}

const {diffClamp} = Animated;
export const headerHeight = {
    main:56,
    sub:56
}

export const TopAction = TopNavigationAction;

const RefreshingHeight = 100;

export const Lottie=React.memo((props: AnimatedLottieViewProps)=>{
    const {style,...other} = props
	const context = React.useContext(AuthContext)
	const {theme} = context

	return <LottieView style={[{height:RefreshingHeight,position:'absolute',top:5,left:0,right:0},style]} autoPlay {...other} source={theme==='dark' ? require('@pn/assets/animation/loading-dark.json') : require('@pn/assets/animation/loading-dark.json')} />
})

export const useHeader=(height=58,onScrollProps?: (event: NativeSyntheticEvent<NativeScrollEvent>)=>void)=>{
	const index = useNavigationState(state=>state.index);
	const clampedScrollValue = React.useRef(0)
	const offsetValue = React.useRef(0)
	const scrollValue = React.useRef(0)
	const scrollEndTimer = React.useRef<NodeJS.Timeout>();

	const scrollAnim = new Animated.Value(0)
	const offsetAnim = new Animated.Value(0)
	const clampedScroll = diffClamp(
		Animated.add(
			scrollAnim.interpolate({
				inputRange:[0,1],
				outputRange:[0,1],
				extrapolateLeft:'clamp'
			}),
			offsetAnim,
		),
		0,
		height
	)

	const onScrollEndDrag=()=>{
		scrollEndTimer.current = setTimeout(onMomentumScrollEnd,250)
	}

	const onMomentumScrollBegin = () => {
        if(scrollEndTimer.current) {
            clearTimeout(scrollEndTimer.current);
        }
    };

	const onMomentumScrollEnd = () => {
        const statusAndToolbarHeight = height;
        const targetOffset = isToolbarNearHidingPosition()
            ? offsetValue.current + statusAndToolbarHeight
            : offsetValue.current - statusAndToolbarHeight ;

		//console.log(isToolbarNearHidingPosition(),targetOffset)
        Animated.timing(offsetAnim, {
            toValue: targetOffset,
            duration: 350,
			useNativeDriver: true
        }).start();
    };

	const isToolbarNearHidingPosition=()=>{
        const toolbarHeight = height;
        const statusAndToolbarHeight = height;
        return scrollValue.current > statusAndToolbarHeight &&
            clampedScrollValue.current > (toolbarHeight) / 2;
    }

	const onScroll = Animated.event<NativeScrollEvent>(
		[
			{
				nativeEvent:{
					contentOffset:{
						y:scrollAnim
					}
				}
			}
		],
		{
			useNativeDriver: true,
			listener:(event)=>{
				if(typeof onScrollProps === 'function') onScrollProps(event);
			}
		},
	)

	const translateY = clampedScroll.interpolate({
		inputRange:[0,height],
		outputRange:[0,-height],
		extrapolate:'clamp'
	})

	React.useEffect(()=>{
		scrollAnim.addListener(({ value }) => {
            const diff = value - scrollValue.current;
            scrollValue.current = value;
            clampedScrollValue.current = Math.min(
                Math.max(clampedScrollValue.current + diff, 0),
                height
            );
        });
		offsetAnim.addListener(({ value }) => {
            offsetValue.current = value;
        });

		return ()=>{
			scrollAnim.removeAllListeners()
			offsetAnim.removeAllListeners()
		}
	})

	return {onMomentumScrollBegin,onMomentumScrollEnd,onScrollEndDrag,onScroll,translateY,scrollEventThrottle:5}
}

export default class Header extends React.PureComponent<HeaderProps> {
	constructor(props: HeaderProps){
		super(props)
	}

	static defaultProps={
		align:'center'
	}

	render(){
		const {withBack,title,menu,navigation,align,children,height,subtitle,margin,withClose,whiteBg} = this.props;
		return(
			<>
				<TopNav
					navigation={navigation}
					title={title}
					withBack={withBack ? true : false}
					align={align}
					subtitle={subtitle}
					menu={menu}
					withClose={withClose}
					margin={margin}
					whiteBg={whiteBg}
					withDivider={false}
					style={{height:height||56}}
				/>
				{children}
				<Divider />
			</>
		)
	}
}