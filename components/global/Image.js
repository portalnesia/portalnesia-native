import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import ImageFullComp from './ImageFull'
import Lightbox from '@pn/components/lightbox/index'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import Img from 'react-native-fast-image'

import { AuthContext } from '@pn/provider/AuthProvider';

export const ImageFull=React.memo(({source,style,fullSize,alt,contentWidth,fancybox,dataSrc,forceFancybox,thumbnail,zoomable,animated=true,...other})=>{
    const {width: screenWidth} = useWindowDimensions()
    const context = React.useContext(AuthContext)
    const {theme:selectedTheme} = context
    const theme = useTheme()

    const onOpen=()=>{
        setStatusBarStyle("light")
        setStatusBarBackgroundColor("#000")
    }
    const onClose=()=>{
        setStatusBarStyle(selectedTheme==='light' ? 'dark' : 'light')
        setStatusBarBackgroundColor(theme['background-basic-color-1'])
    };

    const RenderDataSrc=(
        <ImageFull
            contentWidth={screenWidth}
            source={dataSrc||source}
            alt={alt}
            imagesInitialDimensions={{
                width:300,
                height:300
            }}
            zoomable
            thumbnail={thumbnail}
            animated={animated}
        />
    )

    const ImageComponent=()=>(
        <ImageFullComp
            contentWidth={contentWidth||screenWidth}
            source={source}
            alt={alt}
            imagesInitialDimensions={{
                width:300,
                height:300
            }}
            thumbnail={thumbnail}
            zoomable={typeof zoomable==='boolean' ? zoomable : false}
            animated={animated}
        />
    )

    if(fancybox) {
        return (
            <Lightbox onOpen={onOpen} onClose={onClose} {...(dataSrc || forceFancybox ? {renderContent:RenderDataSrc} : {})} >
                <ImageComponent />
            </Lightbox>
        )
    } else return <ImageComponent />
})

function Image({source,style,fullSize,alt,contentWidth,fancybox,dataSrc,forceFancybox,thumbnail,zoomable,animated=true,...other},ref){
    const {width: screenWidth} = useWindowDimensions()
    const context = React.useContext(AuthContext)
    const {theme:selectedTheme} = context
    const theme = useTheme()

    const onOpen=()=>{
        setStatusBarStyle("light")
        setStatusBarBackgroundColor("#000")
    }
    const onClose=()=>{
        setStatusBarStyle(selectedTheme==='light' ? 'dark' : 'light')
        setStatusBarBackgroundColor(theme['background-basic-color-1'])
    };

    const RenderDataSrc=(
        <ImageFull
            contentWidth={screenWidth}
            source={dataSrc||source}
            alt={alt}
            imagesInitialDimensions={{
                width:300,
                height:300
            }}
            zoomable
            thumbnail={thumbnail}
            animated={animated}
        />
    )


    let ImageComponent;
    if(fullSize) {
        ImageComponent=()=>(
            <ImageFullComp
                contentWidth={contentWidth||screenWidth}
                source={source}
                alt={alt}
                imagesInitialDimensions={{
                    width:300,
                    height:300
                }}
                thumbnail={thumbnail}
                zoomable={typeof zoomable==='boolean' ? zoomable : false}
                animated={animated}
            />
        )
    }
    else {
        ImageComponent=()=><Img ref={ref} {...other} source={source} style={style} />
    }

    if(fancybox) {
        return (
            <Lightbox onOpen={onOpen} onClose={onClose} {...(dataSrc || forceFancybox ? {renderContent:RenderDataSrc} : {})} >
                <ImageComponent />
            </Lightbox>
        )
    } else return <ImageComponent />
}

export default React.forwardRef(Image)