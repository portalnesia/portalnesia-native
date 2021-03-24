import React from 'react'
import {Dimensions} from 'react-native'
import Carousel from 'react-native-snap-carousel';

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

export default React.forwardRef(function({data,renderItem},ref){
    return (
        <Carousel
            ref={ref}
            data={data}
            renderItem={renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
        />
    )
})