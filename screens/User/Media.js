import React from 'react'
import {View,Dimensions,TouchableOpacity,FlatList,Image,Alert} from 'react-native'
import {Layout as Lay,Text,useTheme,Card} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'

//import Image from '@pn/components/global/Image'
import usePagination from '@pn/utils/usePagination'
import Button from '@pn/components/global/Button'
import {RenderMediaPrivate,RenderSuspend} from './PrivateUser'
import { ucwords } from '@pn/utils/Main'
import {GridSkeleton} from '@pn/components/global/Skeleton'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

const SkeletonFollow=()=>{

    return (
        <Lay style={{height:winHeight}}>
            <GridSkeleton number={10} image />
        </Lay>
    )
}

const RenderNews=({item,index,data,onOpen})=>{
    const angka = index % 2;
    const cardSize=(winWidth/2)-7
    if(angka===0) {
        return (
            <React.Fragment key={`fragment-${index}`}>
                <View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>onOpen(item)} header={(props)=>(
                        <View {...props} {...props} style={{...props?.style,padding:0}}>
                            <Image
                                style={{
                                    height:cardSize,
                                    width:cardSize
                                }}
                                source={{uri:item.src}}
                            />
                        </View>
                    )}>
                        <Text category="p1">{item.title}</Text>
                    </Card>
                    {data?.[index+1]?.id && (
                        <Card key={1} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>onOpen(data?.[index+1])} header={(props)=>(
                            <View {...props} style={{...props?.style,padding:0}}>
                                <Image
                                    style={{
                                        height:cardSize,
                                        width:cardSize
                                    }}
                                    source={{uri:data[index+1].src}}
                                />
                            </View>
                        )}>
                            <Text category="p1">{data[index+1].title}</Text>
                        </Card>
                    )}
                </View>
            </React.Fragment>
        )
    } else {
        return null
    }
}

const RenderMedia=React.forwardRef((props,ref)=>{
    const theme=useTheme();
    const navigation = useNavigation();
    const {data:dt,error:err,...swrProps} = usePagination(props.data ? `/user/${props.data?.users?.username}/media` : null,'media',24,false,false)
    
    return <RenderMediaClass ref={ref} {...props} theme={theme} {...swrProps} dt={dt} err={err} navigation={navigation} />
})

class RenderMediaClass extends React.PureComponent{
    constructor(props){
        super(props)
        this.refresh=this.refresh.bind(this)
        this.loadMore=this.loadMore.bind(this)
    }

    refresh(){
        const {mutate,isValidating}=this.props;
        if(!isValidating) mutate();
    }

    loadMore(){
        const {isLoadingMore,isReachingEnd,size,setSize,isLoadingInitialData}=this.props;
        if(!isLoadingMore && !isReachingEnd && !isLoadingInitialData) setSize(size+1);
    }

    componentDidUpdate(prevProps){
        const {isValidating,onValidatingChange,dt,isLoadingMore}=this.props
        if(prevProps.isValidating != isValidating && dt?.length > 0 && !isLoadingMore) {
            return onValidatingChange && onValidatingChange(isValidating)
        }
    }

    handleOpenMenu = (item)=>{
        if(item?.type === 'photo') this.props.onOpen && this.props.onOpen(item)
        else {
            Alert.alert(
                "Under Maintenance",
                "Sorry, this feature is under maintenance.",
                [
                    {
                        text:"OK",
                        onPress:()=>{}
                    }
                ]
            )
        }
    }

    renderFooter(){
        const {isReachingEnd,isLoadingMore}=this.props;
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>You have reach the bottom of the page</Text>
        if(isLoadingMore) return <View paddingTop={20}><GridSkeleton number={4} image /></View>
        return null
    }

    render(){
        const {data,error,dt,isReachingEnd,isLoadingMore,isLoadingInitialData}=this.props

        if((!data && !error) || (data?.error || error)) return <SkeletonFollow />
        if(data?.users?.media_private===true) return <RenderMediaPrivate data={data} />
        if(data?.users?.suspend===true) return <RenderSuspend />

        if(isLoadingInitialData) return <SkeletonFollow />
        return (
            <Lay level="2" style={{minHeight:winHeight}}>
                <FlatList
                    columnWrapperStyle={{flexWrap:'wrap',flex:1}}
                    data={dt}
                    numColumns={2}
                    renderItem={props=> <RenderNews {...props} data={dt} onOpen={this.handleOpenMenu} />}
                    keyExtractor={(item)=>item?.title}
                    scrollEnabled={false}
                    ListFooterComponent={this.renderFooter()}
                />
            </Lay>
        )
    }
}

export default RenderMedia