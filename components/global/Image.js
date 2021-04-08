import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import ImageFullComp from './ImageFull'
import ImageModal from '@pn/components/ImageModal/index'
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
    React.useEffect(()=>{
        if(dataSrc?.uri) {
            Img.preload([
                {uri:dataSrc.uri}
            ])
        }
    },[dataSrc])
    //navigator={dataSrc?.uri ? dataSrc?.uri : forceFancybox && source?.uri ? source?.uri : undefined}
    if(fancybox) {
        return (
            <ImageModal onOpen={onOpen} onClose={onClose} source={dataSrc||source}>
                <ImageComponent />
            </ImageModal>
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

    const RenderDataSrc=React.useMemo(()=>{
        return (
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
    },[dataSrc,source])


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

    React.useEffect(()=>{
        if(dataSrc?.uri) {
            Img.preload([
                {uri:dataSrc.uri}
            ])
        }
    },[dataSrc])
    
    if(fancybox) {
        return (
            <ImageModal onOpen={onOpen} onClose={onClose} source={dataSrc||source}>
                <ImageComponent />
            </ImageModal>
        )
    } else return <ImageComponent />
}

export default React.forwardRef(Image)