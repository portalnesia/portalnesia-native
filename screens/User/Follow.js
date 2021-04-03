import React from 'react'
import {View,Dimensions,TouchableOpacity,Animated,RefreshControl} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider,ListItem} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'

import Image from '@pn/components/global/Image'
import usePagination from '@pn/utils/usePagination'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'
import Avatar from '@pn/components/global/Avatar'
import RenderPrivate,{RenderSuspend} from './PrivateUser'
import { ucwords } from '@pn/utils/Main'
import {ListSkeleton} from '@pn/components/global/Skeleton'
import {TabBarHeight,HeaderHeight,ContentMinHeight} from './utils'

const user=false;

const winHeight = Dimensions.get('window').height;

const MemoAvatar=React.memo(({item})=>(
    <Avatar style={{marginRight:10}} {...(item?.image !== null ? {src:`${item?.image}&size=50&watermark=no`} : {name:ucwords(item?.name)})} size={45} />
))
/*
accessoryRight={(props)=>(
    <TouchableOpacity activeOpacity={0.7} style={{padding:5}} onPress={()=>onOpen(item)}><Icon {...props} name="more-vertical" /></TouchableOpacity>
)}
*/
const RenderUser=React.memo(({item,index,onOpen})=>{
    const navigation=useNavigation()
    return (
        <ListItem
            key={index.toString()}
            title={item?.name}
            description={`@${item?.username}`}
            accessoryLeft={()=><MemoAvatar item={item} />}
            onPress={()=>navigation.push("User",{username:item?.username})}
        />
    )
})

const SkeletonFollow=()=>{

    return (
        <ListSkeleton height={winHeight} number={10} image />
    )
}

const RenderFollow=React.forwardRef((props,ref)=>{
    const {data:dt,error:err,...swrProps} = usePagination(props.data && !props?.data?.users?.private && !props?.data?.users?.suspend ? `/user/${props.data?.users?.username}/${props.type}` : null,props.type,20,false,false)
    const theme=useTheme()
    return <RenderFollowClass ref={ref} {...props} theme={theme} {...swrProps} dt={dt} err={err} />
})

class RenderFollowClass extends React.PureComponent{
    constructor(props){
        super(props)
        this.refresh=this.refresh.bind(this)
        this.loadMore=this.loadMore.bind(this)
        this.state={
            refreshing:false
        }
    }

    handleOpenMenu = (item)=>{
        this.props.onOpen && this.props.onOpen(item)
    }

    refresh=()=>{
        const {mutate,isValidating}=this.props;
        if(!isValidating) {
            this.setState({refreshing:true})
            mutate();
        }
    }

    loadMore=()=>{
        const {isLoadingMore,isReachingEnd,size,setSize,isLoadingInitialData}=this.props;
        if(!isLoadingMore && !isReachingEnd && !isLoadingInitialData) setSize(size+1);
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

    renderFooter(){
        const {isReachingEnd,isLoadingMore}=this.props;
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>You have reach the bottom of the page</Text>
        if(isLoadingMore) return <View paddingTop={20}><ListSkeleton height={250} number={3} image /></View>
        return null
    }

    render(){
        const {data,error,theme,dt,isValidating,isLoadingInitialData,onGetRef,scrollY,onMomentumScrollBegin,onMomentumScrollEnd,onScrollEndDrag}=this.props

        if(isLoadingInitialData || (!data && !error) || (data?.error || error) || data?.users?.private===true || data?.users?.suspend===true) {
            return (
                <Animated.ScrollView
                    scrollToOverflowEnabled
                    ref={onGetRef}
                    onScroll={Animated.event(
                        [
                            {nativeEvent:{contentOffset:{y:scrollY}}}
                        ],
                        {
                            useNativeDriver:true
                        }
                    )}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    onScrollEndDrag={onScrollEndDrag}
                    contentContainerStyle={{
                        paddingTop:HeaderHeight + TabBarHeight + 56,
                        minHeight:winHeight + ContentMinHeight
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    {data?.users?.private==true ? (
                        <RenderPrivate data={data} />
                    ) : data?.users?.suspend==true ? (
                        <RenderSuspend />
                    ) :  (
                        <SkeletonFollow />
                    )}
                </Animated.ScrollView>
            )
        }
        return (
                <Animated.FlatList
                    data={dt}
                    renderItem={(props)=> <RenderUser {...props} onOpen={this.handleOpenMenu.bind(this)} />}
                    ItemSeparatorComponent={Divider}
                    ListFooterComponent={this.renderFooter()}
                    scrollToOverflowEnabled
                    ref={onGetRef}
                    onScroll={Animated.event(
                        [
                            {nativeEvent:{contentOffset:{y:scrollY}}}
                        ],
                        {
                            useNativeDriver:true
                        }
                    )}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    onScrollEndDrag={onScrollEndDrag}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop:HeaderHeight + TabBarHeight + 56,
                        minHeight:winHeight + ContentMinHeight
                    }}
                    refreshControl={
                        <RefreshControl
                            style={{zIndex:5}}
                            colors={['white']}
                            progressBackgroundColor="#2f6f4e"
                            refreshing={this.state.refreshing}
                            progressViewOffset={HeaderHeight + TabBarHeight + 56}
                            title="Refreshing"
                            onRefresh={()=>this.refresh()}
                        />
                    }
                    keyExtractor={(_,i)=>i.toString()}
                    onEndReached={()=>this.loadMore()}
                    onEndReachedThreshold={0.02}
                />
        )
    }
}

export default RenderFollow