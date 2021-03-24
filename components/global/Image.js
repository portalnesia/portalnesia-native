import React from 'react'
import {Image as Img,useWindowDimensions,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import ImageFull from './ImageFull'
import Lightbox from '@pn/components/lightbox/index'
import {setStatusBarBackgroundColor,setStatusBarStyle} from 'expo-status-bar'

import { AuthContext } from '@pn/provider/AuthProvider';

function Image({source,style,fullSize,alt,contentWidth,fancybox,dataSrc,forceFancybox,thumbnail,zoomable,animated=true,...other}){
    const {width: screenWidth} = useWindowDimensions()
    const context = React.useContext(AuthContext)
    const {theme:selectedTheme} = context
    const theme = useTheme()
    /*
    const [show,setShow]=React.useState(false)

    if(fancybox) {
        return (
            <ImageView
                images={source}
                imageIndex={0}
                visible={show}
                onRequestClose={()=>setShow(false)}
                
            />
        )
    }
    */
    const onOpen=()=>{
        /*if(dataSrc) {
            if(typeof dataSrc === 'object') {
                if(dataSrc.uri !== source.uri) setSrc(dataSrc)
            } else {
                setSrc(dataSrc)
            }
        }*/
        setStatusBarStyle("light")
        setStatusBarBackgroundColor("#000")
    }
    const onClose=()=>{
        /*if(dataSrc) {
            if(typeof dataSrc === 'object') {
                if(dataSrc.uri !== source.uri) setSrc(source)
            } else {
                setSrc(source)
            }
        }*/
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
            <ImageFull
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
        ImageComponent=()=><Img {...other} source={source} style={style} />
    }

    if(fancybox) {
        return (
            <Lightbox onOpen={onOpen} onClose={onClose} {...(dataSrc || forceFancybox ? {renderContent:RenderDataSrc} : {})} >
                <ImageComponent />
            </Lightbox>
        )
    } else return <ImageComponent />
}

export default React.memo(Image)