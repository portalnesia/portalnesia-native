import React from 'react'
import {useWindowDimensions,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import ImageFullComp from './ImageFull'
import ImageModal from '@pn/components/ImageModal/index'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'
import Img from 'react-native-fast-image'

import { AuthContext } from '@pn/provider/AuthProvider';

export const ImageFull=React.memo(({source,style,alt,contentWidth,fancybox,dataSrc,forceFancybox,thumbnail,zoomable,onOpen,onClose,animated=true,...other})=>{
    const {width: screenWidth} = useWindowDimensions()
    const context = React.useContext(AuthContext)
    const {theme:selectedTheme} = context
    const theme = useTheme()

    const onOpened=React.useCallback(()=>{
        setStatusBarStyle("light")
        setStatusBarBackgroundColor("#000",true)
        typeof onOpen === 'function' && onOpen();
    },[onOpen])
    const onClosed=React.useCallback(()=>{
        setStatusBarStyle(selectedTheme==='light' ? 'dark' : 'light')
        setStatusBarBackgroundColor(theme['background-basic-color-1'],true)
        typeof onClose === 'function' && onClose();
    },[theme,selectedTheme,onClose]);

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
            <ImageModal onOpen={onOpened} willClose={onClosed} source={dataSrc||source} renderToHardwareTextureAndroid isTranslucent >
                <ImageComponent />
            </ImageModal>
        )
    } else return <ImageComponent />
})

function Image({source,style,fullSize,alt,contentWidth,fancybox,dataSrc,forceFancybox,thumbnail,zoomable,animated=true,onOpen,onClose,...other},ref){
    const {width: screenWidth} = useWindowDimensions()
    const context = React.useContext(AuthContext)
    const {theme:selectedTheme} = context
    const theme = useTheme()

    const onOpened=React.useCallback(()=>{
        setStatusBarStyle("light")
        setStatusBarBackgroundColor("#000",true)
        typeof onOpen === 'function' && onOpen();
    },[onOpen])

    const onClosed=React.useCallback(()=>{
        setStatusBarStyle(selectedTheme==='light' ? 'dark' : 'light')
        setStatusBarBackgroundColor(theme['background-basic-color-1'],true)
        typeof onClose === 'function' && onClose();
    },[theme,selectedTheme,onClose]);

    const ImageComponent=React.useCallback(()=>{
        if(fullSize) {
            return (
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
        } else {
            return <Img ref={ref} {...other} source={source} style={style} />
        }
    },[fullSize,contentWidth,source,style,thumbnail,animated,zoomable,alt,screenWidth])

    React.useEffect(()=>{
        if(dataSrc?.uri) {
            Img.preload([
                {uri:dataSrc.uri}
            ])
        }
    },[dataSrc])
    
    if(fancybox) {
        return (
            <ImageModal onOpen={onOpened} willClose={onClosed} source={dataSrc||source} renderToHardwareTextureAndroid>
                <ImageComponent />
            </ImageModal>
        )
    } else return <ImageComponent />
}
const ImageRef = React.forwardRef(Image)
export default React.memo(ImageRef)