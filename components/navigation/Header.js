import React from 'react';
import {Icon,Divider, TopNavigation,TopNavigationAction,Text} from '@ui-kitten/components'
import {Animated,StatusBar} from 'react-native'

const STATUS_BAR_HEIGHT = StatusBar.currentHeight

const {diffClamp} = Animated;
export const headerHeight = {
    main:56,
    sub:56
}

const BackIcon=(props)=>(
	<Icon {...props} name='arrow-back' />
)

export const useHeader=(height=56)=>{
	const clampedScrollValue = React.useRef(0)
	const offsetValue = React.useRef(0)
	const scrollValue = React.useRef(0)
	const scrollEndTimer = React.useRef();

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
	},[])

	const onScrollEndDrag=()=>{
		scrollEndTimer.current = setTimeout(onMomentumScrollEnd,250)
	}

	const onMomentumScrollBegin = () => {
        clearTimeout(scrollEndTimer.current);
    };

	const onMomentumScrollEnd = () => {
        const statusAndToolbarHeight = height + STATUS_BAR_HEIGHT;
        const targetOffset = isToolbarNearHidingPosition()
            ? offsetValue.current + statusAndToolbarHeight
            : offsetValue.current - statusAndToolbarHeight ;

        Animated.timing(offsetAnim, {
            toValue: targetOffset,
            duration: 350,
			useNativeDriver: true
        }).start();
    };

	const isToolbarNearHidingPosition=()=>{
        const toolbarHeight = height;
        const statusAndToolbarHeight = height + STATUS_BAR_HEIGHT;
        return scrollValue.current > statusAndToolbarHeight &&
            clampedScrollValue.current > (toolbarHeight) / 2;
    }

	const onScroll = Animated.event(
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
		},
	)

	const translateY = clampedScroll.interpolate({
		inputRange:[0,height],
		outputRange:[0,-height],
		extrapolate:'clamp'
	})

	return {onMomentumScrollBegin,onMomentumScrollEnd,onScrollEndDrag,onScroll,translateY,scrollEventThrottle:5}
}

const Header = ({withBack,title,menu,navigation,align,children,height,subtitle})=>{
	const RenderBackBtn=({navigation})=>{
		if(withBack) {
			return(
				<TopNavigationAction icon={BackIcon} onPress={() => {navigation.goBack()}} />
			)
		}
		else return null;
	}

	return(
		<>
		<TopNavigation
            style={{height:(height||56)}}
			title={evaProps => <Text {...evaProps} style={{...evaProps?.style,marginHorizontal:50}} numberOfLines={1} >{title}</Text>}
			{...(typeof subtitle === 'string' && subtitle?.length > 0 ? {subtitle:(evaProps)=><Text {...evaProps} style={{...evaProps?.style,marginHorizontal:50}} numberOfLines={1}>{subtitle}</Text>} : {})}
			alignment={align}
			{...(withBack ? {accessoryLeft:()=><RenderBackBtn navigation={navigation} />} : {})}
			{...(menu ? {accessoryRight:menu} : {})}
		/>
        {children}
		<Divider />
		</>
	)
}

Header.defaultProps={
	align:'center'
}
export default Header