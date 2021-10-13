import React from 'react'
import {View,Dimensions,TouchableOpacity,RefreshControl, Animated} from 'react-native'
import {Layout as Lay,Text,useTheme,Card} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'
import Image from '@pn/module/FastImage'

//import Image from '@pn/components/global/Image'
import usePagination from '@pn/utils/usePagination'
import Button from '@pn/components/global/Button'
import {RenderMediaPrivate,RenderSuspend} from './PrivateUser'
import { ucwords } from '@portalnesia/utils'
import {GridSkeleton} from '@pn/components/global/Skeleton'
import {TabBarHeight,HeaderHeight,ContentMinHeight} from './utils'
import { AuthContext } from '@pn/provider/Context';
import {linkTo} from '@pn/navigation/useRootNavigation'

const {height:winHeight,width:winWidth} = Dimensions.get('window');

const SkeletonFollow=()=>{

    return (
        <GridSkeleton height={winHeight} number={10} image />
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
    const context = React.useContext(AuthContext)
    const {setNotif} = context
    const theme=useTheme();
    const navigation = useNavigation();
    const {data:dt,error:err,...swrProps} = usePagination(props.data && !props?.data?.users?.media_private && !props?.data?.users?.suspend ? `/user/${props.data?.users?.username}/media` : null,'media',24,false)
    return <RenderMediaClass ref={ref} {...props} theme={theme} {...swrProps} dt={dt} err={err} navigation={navigation} setNotif={setNotif} />
})

class RenderMediaClass extends React.PureComponent{
    constructor(props){
        super(props)
        this.refresh=this.refresh.bind(this)
        this.loadMore=this.loadMore.bind(this)
        this.state={
            refreshing:false
        }
    }

    refresh(){
        const {mutate,isValidating}=this.props;
        if(!isValidating) {
            this.setState({refreshing:true})
            mutate();
        }
    }

    loadMore(){
        const {isLoadingMore,isReachingEnd,size,setSize,isLoadingInitialData}=this.props;
        if(!isLoadingMore && !isReachingEnd && !isLoadingInitialData) setSize(size+1);
    }

    renderEmpty() {
        return (
            <View style={{justifyContent:"center",alignItems:"center",flexDirection:"row",height:56}}>
                <Text>No Data</Text>
            </View>
        )
    }

    componentDidUpdate(prevProps){
        const {isValidating,onValidatingChange,dt,isLoadingMore}=this.props
        if(prevProps.isValidating != isValidating && dt?.length > 0 && !isLoadingMore) {
            if(onValidatingChange) onValidatingChange(isValidating)
        }
        if(!isValidating) {
            this.setState({refreshing:false})
        }
    }

    handleOpenMenu = (item)=>{
        if(item?.type === 'photo') this.props.onOpen && this.props.onOpen(item)
        else {
            linkTo(`/media/${item?.id}`);
        }
    }

    renderFooter(){
        const {isReachingEnd,isLoadingMore,dt}=this.props;
        if(dt?.length == 0) return null;
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>You have reach the bottom of the page</Text>
        if(isLoadingMore) return <View paddingTop={20}><GridSkeleton height={300} number={2} image /></View>
        return null
    }

    render(){
        const {data,error,dt,isValidating,theme,isLoadingInitialData,onGetRef,onScroll,containerPaddingTop,scrollIndicatorInsetTop,onScrollEndDrag}=this.props

        if(isLoadingInitialData || (!data && !error) || (data?.error || error) || data?.users?.media_private===true || data?.users?.suspend===true) {
            return (
                <Animated.ScrollView
                    scrollToOverflowEnabled
                    ref={onGetRef}
                    onScroll={onScroll}
                    onScrollEndDrag={onScrollEndDrag}
                    contentContainerStyle={{
                        paddingTop:HeaderHeight + containerPaddingTop,
                        minHeight:winHeight + ContentMinHeight
                    }}
                    scrollIndicatorInsets={{top:HeaderHeight+scrollIndicatorInsetTop}}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    {data?.users?.media_private==true ? (
                        <RenderMediaPrivate data={data} />
                    ) : data?.users?.suspend==true ? (
                        <RenderMediaPrivate data={data} />
                    ) : (
                        <View style={{marginTop:5}}><SkeletonFollow /></View>
                    )}
                </Animated.ScrollView>
            )
        }
        return (
            <Animated.FlatList
                columnWrapperStyle={{flexWrap:'wrap',flex:1}}
                data={dt}
                numColumns={2}
                renderItem={props=> <RenderNews {...props} data={dt} onOpen={this.handleOpenMenu} />}
                keyExtractor={(item)=>item?.title}
                ListFooterComponent={this.renderFooter()}
                ListEmptyComponent={this.renderEmpty()}
                scrollToOverflowEnabled
                ref={(ref)=>onGetRef(ref)}
                onScroll={onScroll}
                onScrollEndDrag={onScrollEndDrag}
                contentContainerStyle={{
                    paddingTop:HeaderHeight + containerPaddingTop,
                    minHeight:winHeight + ContentMinHeight,
                    backgroundColor:theme['background-basic-color-2']
                }}
                scrollIndicatorInsets={{top:HeaderHeight+scrollIndicatorInsetTop}}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        style={{zIndex:5}}
                        colors={['white']}
                        progressBackgroundColor="#2f6f4e"
                        refreshing={this.state.refreshing}
                        progressViewOffset={HeaderHeight + containerPaddingTop}
                        title="Refreshing"
                        onRefresh={()=>this.refresh()}
                    />
                }
                onEndReached={()=>this.loadMore()}
                onEndReachedThreshold={0.02}
            />
        )
    }
}

export default RenderMedia