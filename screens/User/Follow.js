import React from 'react'
import {View,Dimensions,TouchableOpacity} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider,List,ListItem} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'

import Image from '@pn/components/global/Image'
import usePagination from '@pn/utils/usePagination'
import useSWR from '@pn/utils/swr'
import Button from '@pn/components/global/Button'
import Avatar from '@pn/components/global/Avatar'
import RenderPrivate,{RenderSuspend} from './PrivateUser'
import { ucwords } from '@pn/utils/Main'
import {ListSkeleton} from '@pn/components/global/Skeleton'

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
            key={index}
            title={item?.name}
            description={`@${item?.username}`}
            accessoryLeft={()=><MemoAvatar item={item} />}
            onPress={()=>navigation.push("User",{username:item?.username})}
        />
    )
})

const SkeletonFollow=()=>{

    return (
        <Lay style={{padding:15,height:winHeight}}>
            <ListSkeleton number={10} image />
        </Lay>
    )
}

const RenderFollow=React.forwardRef((props,ref)=>{
    const {data:dt,error:err,...swrProps} = usePagination(props.data ? `/user/${props.data?.users?.username}/${props.type}` : null,props.type,20,false,false)
    const theme=useTheme()
    return <RenderFollowClass ref={ref} {...props} theme={theme} {...swrProps} dt={dt} err={err} />
})

class RenderFollowClass extends React.PureComponent{
    constructor(props){
        super(props)
        this.refresh=this.refresh.bind(this)
        this.loadMore=this.loadMore.bind(this)
    }

    handleOpenMenu = (item)=>{
        this.props.onOpen && this.props.onOpen(item)
    }

    refresh=()=>{
        const {mutate,isValidating}=this.props;
        if(!isValidating) mutate();
    }

    loadMore=()=>{
        const {isLoadingMore,isReachingEnd,size,setSize,isLoadingInitialData}=this.props;
        if(!isLoadingMore && !isReachingEnd && !isLoadingInitialData) setSize(size+1);
    }

    componentDidUpdate(prevProps){
        const {isValidating,onValidatingChange,dt,isLoadingMore}=this.props
        if(prevProps.isValidating != isValidating && dt?.length > 0 && !isLoadingMore) {
            return onValidatingChange && onValidatingChange(isValidating)
        }
    }

    renderFooter(){
        const {isReachingEnd,isLoadingMore}=this.props;
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>You have reach the bottom of the page</Text>
        if(isLoadingMore) return <View paddingTop={20}><ListSkeleton number={3} image /></View>
        return null
    }

    render(){
        const {data,error,dt,theme,isLoadingInitialData,isLoadingMore,isReachingEnd}=this.props;
        if((!data && !error) || (data?.error || error)) return <SkeletonFollow />
        if(data?.users?.private===true) return <RenderPrivate data={data} />
        if(data?.users?.suspend===true) return <RenderSuspend />
        if(isLoadingInitialData) return <SkeletonFollow />
        return (
            <Lay style={{minHeight:winHeight}}>
                <List
                    data={dt}
                    renderItem={(props)=> <RenderUser {...props} onOpen={this.handleOpenMenu.bind(this)} />}
                    ItemSeparatorComponent={Divider}
                    contentContainerStyle={{backgroundColor:theme['background-basic-color-1']}}
                    style={{backgroundColor:theme['background-basic-color-1']}}
                    scrollEnabled={false}
                    ListFooterComponent={this.renderFooter()}
                />
            </Lay>
        )
    }
}

export default RenderFollow