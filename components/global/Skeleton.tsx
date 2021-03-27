import React from 'react'
import Skltn,{SkeletonPlaceholderItem} from 'react-native-skeleton-placeholder'
import {useWindowDimensions,View} from 'react-native'

export type SkeletonProps={
    type:'paragraph'|'rect'|'text'|'grid'|'article'
    number:number,
    width?:number,
    textProps?: SkeletonPlaceholderItem
    image?: boolean,
    gridStyle?:SkeletonPlaceholderItem
}

const PararaphSkeleton=({number}:SkeletonProps)=>{
    const {width} = useWindowDimensions();
    return (
        <Skltn>
            <Skltn.Item alignItems="center">
                {[...Array(number).keys()].map((_,index)=>(
                    <Skltn.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                ))}
            </Skltn.Item>
        </Skltn>
    )
}

const TextSkeleton=(props: SkeletonPlaceholderItem)=>{
    const {width} = useWindowDimensions();
    const textWidth = props.width||width-30;
    return (
        <Skltn>
            <Skltn.Item height={20} justifyContent="flex-start" width={textWidth} borderRadius={4} {...props} />
        </Skltn>
    )
}

const RectSkeleton=({width=200}:{width?:number})=>{
    const {width:screenWidth} = useWindowDimensions();
    width = width||screenWidth;
    return (
        <Skltn>
            <Skltn.Item height={width} width={width} borderRadius={4} />
        </Skltn>
    )
}

const GridSkeleton=({number=6,image,gridStyle={}}:{number:number,image?:boolean,gridStyle?:SkeletonPlaceholderItem})=>{
    const {width} = useWindowDimensions();

    const renderItemWithImage=(index: number)=>{
        const cardSize=(width/2)-7
        return(
            <Skltn.Item flexDirection="row" justifyContent="space-between" alignItems="center" key={index} {...gridStyle}>
                <Skltn.Item width={cardSize} margin={5} marginRight={2}>
                    <Skltn.Item height={cardSize} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                    <Skltn.Item height={15} width={cardSize/3} borderRadius={4} />
                </Skltn.Item>
                <Skltn.Item width={cardSize} margin={5} marginLeft={2}>
                    <Skltn.Item height={cardSize} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                    <Skltn.Item height={15} width={cardSize/3} borderRadius={4} />
                </Skltn.Item>
            </Skltn.Item>
        )
    }

    const renderItemNoImage=(index: number)=>{
        const cardSize=(width/2)-7
        return(
            <Skltn.Item flexDirection="row" justifyContent="space-between" alignItems="center" key={index} {...gridStyle}>
                <Skltn.Item width={cardSize} margin={5} marginRight={2}>
                    <Skltn.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                </Skltn.Item>
                <Skltn.Item width={cardSize} margin={5} marginLeft={2}>
                    <Skltn.Item height={27} width={cardSize} borderRadius={4} marginBottom={5} />
                    <Skltn.Item height={15} width={cardSize/2} borderRadius={4} marginBottom={2} />
                </Skltn.Item>
            </Skltn.Item>
        )
    }

    return (
        <Skltn>
            <Skltn.Item>
                {[...Array(Math.floor(number/2)).keys()].map((_,index)=>{
                    if(image) return renderItemWithImage(index);
                    else return renderItemNoImage(index);
                })}
            </Skltn.Item>
        </Skltn>
    )
}

const ArticleSkeleton=()=>{
    const {width} = useWindowDimensions();
    const number=5;
    return(
        <Skltn>
            <Skltn.Item flexDirection="column" alignItems="center">
                <View />
                <Skltn.Item height={30} width={width-30} borderRadius={4} marginBottom={2} />
                <Skltn.Item height={30} width={(width*2/3)-30} marginRight={(width/3)} borderRadius={4} marginBottom={2} />
                <Skltn.Item marginVertical={20}>
                    <Skltn.Item flexDirection="row" justifyContent="space-between" width={width-30} alignItems="center">
                        <Skltn.Item height={15} width={width/3} borderRadius={4} marginBottom={2} />
                        <Skltn.Item height={15} width={width/4} borderRadius={4} marginBottom={2} />
                    </Skltn.Item>
                    <Skltn.Item flexDirection="row" justifyContent="space-between" width={width-30} alignItems="center">
                        <Skltn.Item height={15} width={width*4/9} borderRadius={4} marginBottom={2} />
                        <Skltn.Item height={15} width={width/5} borderRadius={4} marginBottom={2} />
                    </Skltn.Item>
                </Skltn.Item>
                <Skltn.Item key={"article"} marginTop={20} marginBottom={10}>
                    <View />
                    <Skltn.Item height={width/2} width={width} borderRadius={4} marginBottom={20} />
                    <Skltn.Item marginBottom={20} alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Skltn.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Skltn.Item>
                    <Skltn.Item  marginBottom={20} alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Skltn.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Skltn.Item>
                    <Skltn.Item  alignItems="center">
                        {[...Array(number).keys()].map((_,index)=>(
                            <Skltn.Item borderRadius={4} width={index===0 || index+1===number ? width-80 : width-30} marginLeft={index===0 ? 50 : 0} marginRight={index+1===number ? 50 : 0} height={20} key={index} marginBottom={index+1===number ? 0 : 5} />
                        ))}
                    </Skltn.Item>
                </Skltn.Item>
            </Skltn.Item>
        </Skltn>
    )
}

export default function Skeleton({type,number=3,width,textProps,image,gridStyle}: SkeletonProps): React.ReactNode {
    if(type==='paragraph') return <PararaphSkeleton type={type} number={number} />
    else if(type==='rect') return <RectSkeleton width={width} />
    else if(type==='text' && textProps) return <TextSkeleton {...textProps} />
    else if(type==='grid') return <GridSkeleton number={number} image={image} gridStyle={gridStyle} />
    else if(type==='article') return <ArticleSkeleton />
    return null;
}