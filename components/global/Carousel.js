import React from 'react'
import {Dimensions} from 'react-native'
import Carousell from 'react-native-snap-carousel';

const { width: viewportWidth } = Dimensions.get('window');

function wp (percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

//const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(85);
const itemHorizontalMargin = wp(3);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth - itemHorizontalMargin;

const Carousel = React.forwardRef(function({data,renderItem,loop,autoplay,...other},ref){
    const loops = autoplay ? true : loop;
    return (
        <Carousell
            ref={ref}
            {...other}
            data={data}
            renderItem={renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            autoplay={autoplay}
            loop={loops}
        />
    )
})

export default Carousel