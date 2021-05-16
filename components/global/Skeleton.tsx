import React from 'react'
import Sklton,{SkeletonPlaceholderItem,SkeletonPlaceholderProps} from 'react-native-skeleton-placeholder'
import {useWindowDimensions,View} from 'react-native'
import {useTheme} from '@ui-kitten/components'
import withTheme from '../HOC/withTheme'

export type SkeletonProps={
    type:'paragraph'|'rect'|'text'|'grid'|'article'|'list'|'caraousel'
    number:number,
    width?:number,
    textProps?: SkeletonPlaceholderItem
    image?: boolean,
    gridStyle?:SkeletonPlaceholderItem
    height?:number
}

interface TextProps extends SkeletonPlaceholderItem{
    rootHeight?:number
}

export const PararaphSkeleton=({number,height}:SkeletonProps)=>{
    const theme=useTheme();
    const {width} = useWindowDimensions();
    return (
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item alignItems="center">
                {[...Array(number).keys()].map((_,index)=>(
                    <Sklton.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                ))}
            </Sklton.Item>
        </Sklton>
    )
}

export const TextSkeleton=(props: TextProps)=>{
    const theme=useTheme();
    const {width} = useWindowDimensions();
    const textWidth = props.width||width-30;
    return (
        <Sklton height={props.rootHeight} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item height={20} justifyContent="flex-start" width={textWidth} borderRadius={4} {...props} />
        </Sklton>
    )
}

export const RectSkeleton=({width=200,height}:{width?:number,height:number})=>{
    const theme=useTheme();
    const {width:screenWidth} = useWindowDimensions();
    width = width||screenWidth;
    return (
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item height={width} width={width} borderRadius={4} />
        </Sklton>
    )
}

export const GridSkeleton=({number=6,image,gridStyle={},height}:{height:number,number:number,image?:boolean,gridStyle?:SkeletonPlaceholderItem})=>{
    
    const {width} = useWindowDimensions();
    const theme=useTheme();
    const renderItemWithImage=(index:number)=>{
        const cardSize=(width/2)-7
        return(
            <Sklton.Item flexDirection="row" justifyContent="space-between" alignItems="center" key={index} {...gridStyle}>
                <Sklton.Item width={cardSize} margin={5} marginRight={2}>
                    <Sklton.Item height={cardSize} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                    <Sklton.Item height={15} width={cardSize/3} borderRadius={4} />
                </Sklton.Item>
                <Sklton.Item width={cardSize} margin={5} marginLeft={2}>
                    <Sklton.Item height={cardSize} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                    <Sklton.Item height={15} width={cardSize/3} borderRadius={4} />
                </Sklton.Item>
            </Sklton.Item>
        )
    }

    const renderItemNoImage=(index:number)=>{
        const cardSize=(width/2)-7
        return(
            <Sklton.Item flexDirection="row" justifyContent="space-between" alignItems="center" key={index} {...gridStyle}>
                <Sklton.Item width={cardSize} margin={5} marginRight={2}>
                    <Sklton.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                </Sklton.Item>
                <Sklton.Item width={cardSize} margin={5} marginLeft={2}>
                    <Sklton.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Sklton.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                </Sklton.Item>
            </Sklton.Item>
        )
    }

    return (
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item>
                {[...Array(Math.floor(number/2)).keys()].map((_,index)=>{
                    if(image) return renderItemWithImage(index)
                    else return renderItemNoImage(index)
                })}
            </Sklton.Item>
        </Sklton>
    )
}

export const ListSkeleton=({number=3,image=false,imageSize=60,height}: {height:number,number?:number,image?:boolean,imageSize?:number})=>{
    const theme=useTheme();
    const {width} = useWindowDimensions();

    const renderWithImage=(index: number)=>{

        return (
            <Sklton.Item key={index} flexDirection="row" justifyContent='flex-start' alignItems="center" marginBottom={15}>
                <Sklton.Item height={imageSize} width={imageSize} borderRadius={30} marginRight={15} />
                <Sklton.Item>
                    <Sklton.Item height={25} width={width-50-imageSize} marginBottom={5} borderRadius={5}  />
                    <Sklton.Item height={15} width={(width-50-imageSize)/2} borderRadius={5} />
                </Sklton.Item>
            </Sklton.Item>
        )
    }

    const renderNoImage=(index: number)=>{
        return (
            <Sklton.Item key={index} flexDirection="row" justifyContent='space-between' alignItems="center" marginBottom={15}>
                <Sklton.Item height={25} width={width-40} marginBottom={5} borderRadius={5} />
                <Sklton.Item height={15} width={(width-40)/2} borderRadius={5} />
            </Sklton.Item>
        )
    }

    return (
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <View style={{paddingHorizontal:15}}>
                {[...Array(number).keys()].map((_,index)=>{
                    if(image) return renderWithImage(index)
                    else return renderNoImage(index)
                })}
            </View>
        </Sklton>
    )
}

export const ArticleSkeleton=({height}:{height:number})=>{
    const theme=useTheme();
    const {width} = useWindowDimensions();
    const number=5;
    return(
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item flexDirection="column" alignItems="center">
                <View />
                <Sklton.Item height={30} width={width-30} borderRadius={4} marginBottom={2} />
                <Sklton.Item height={30} width={(width*2/3)-30} marginRight={(width/3)} borderRadius={4} marginBottom={2} />
                <Sklton.Item marginVertical={20}>
                    <Sklton.Item flexDirection="row" justifyContent="space-between" width={width-30} alignItems="center">
                        <Sklton.Item height={15} width={width/3} borderRadius={4} marginBottom={2} />
                        <Sklton.Item height={15} width={width/4} borderRadius={4} marginBottom={2} />
                    </Sklton.Item>
                    <Sklton.Item flexDirection="row" justifyContent="space-between" width={width-30} alignItems="center">
                        <Sklton.Item height={15} width={width*4/9} borderRadius={4} marginBottom={2} />
                        <Sklton.Item height={15} width={width/5} borderRadius={4} marginBottom={2} />
                    </Sklton.Item>
                </Sklton.Item>
                <Sklton.Item key={"article"} marginTop={20} marginBottom={10}>
                    <View />
                    <Sklton.Item height={width/2} width={width} borderRadius={4} marginBottom={20} />
                    <Sklton.Item marginBottom={20} alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Sklton.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Sklton.Item>
                    <Sklton.Item  marginBottom={20} alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Sklton.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Sklton.Item>
                    <Sklton.Item  alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Sklton.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Sklton.Item>
                </Sklton.Item>
            </Sklton.Item>
        </Sklton>
    )
}

export const CaraouselSkeleton=({image,gridStyle={},height}:{height:number,image?:boolean,gridStyle?:SkeletonPlaceholderItem})=>{
    
    const {width} = useWindowDimensions();
    const theme=useTheme();
    const textWidth = width-30
    const cardSize=(width/2)-7
    const renderItemWithImage=()=>{
        return(
            <Sklton.Item width={textWidth}>
                <Sklton.Item flexDirection="row" justifyContent="center" alignItems="center">
                    <Sklton.Item height={cardSize} alignItems="center" width={cardSize} borderRadius={4} marginBottom={10} />
                </Sklton.Item>
                <Sklton.Item height={27} width={textWidth} borderRadius={4} marginBottom={5} />
                <Sklton.Item height={15} width={textWidth/2} borderRadius={4} marginBottom={2} />
                <Sklton.Item height={15} width={textWidth/3} borderRadius={4} />
            </Sklton.Item>
        )
    }

    const renderItemNoImage=()=>{
        return(
            <Sklton.Item width={textWidth}>
                <Sklton.Item height={27} width={textWidth} borderRadius={4} marginBottom={5} />
                <Sklton.Item height={15} width={textWidth/2} borderRadius={4} marginBottom={2} />
            </Sklton.Item>
        )
    }

    return (
        <Sklton height={height} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}>
            <Sklton.Item>
                {image ? renderItemWithImage() : renderItemNoImage()}
            </Sklton.Item>
        </Sklton>
    )
}

interface SkltnProps extends SkeletonPlaceholderProps {
    theme: Record<string,string>
}

class Skltnn extends React.PureComponent<SkltnProps> {
    constructor(props: SkltnProps){
        super(props);
    }
    render(){
        const {backgroundColor,highlightColor,theme,...rest} = this.props;
        return <Sklton {...rest} backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']}/>
    }
}

export const SkltnView=(props: SkeletonPlaceholderItem)=>{
    return <Sklton.Item {...props} />
}

export const Skltn = withTheme<SkltnProps>(Skltnn);

export default function Skeleton({type,number=3,width,textProps,image,gridStyle,height}: SkeletonProps): JSX.Element|null {
    const {height:winHeight}=useWindowDimensions()
    height=height||winHeight
    if(type==='paragraph') return <PararaphSkeleton type={type} number={number} height={height} />
    else if(type==='rect') return <RectSkeleton width={width} height={height} />
    else if(type==='text' && textProps) return <TextSkeleton {...textProps} rootHeight={height} />
    else if(type==='grid') return <GridSkeleton number={number} image={image} gridStyle={gridStyle} height={height} />
    else if(type==='article') return <ArticleSkeleton height={height} />
    else if(type==='list') return <ListSkeleton height={height} number={number} image={image} />
    else if(type=='caraousel') return <CaraouselSkeleton image={image} gridStyle={gridStyle} height={height} />
    return null;
}