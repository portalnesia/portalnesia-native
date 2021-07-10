import React from 'react'
import {View,Dimensions,TouchableOpacity,Animated,RefreshControl} from 'react-native'
import {Layout as Lay,Text,useTheme,Icon,Divider,ListItem} from '@ui-kitten/components'
import {useNavigation} from '@react-navigation/native'
import i18n from 'i18n-js'

import usePagination from '@pn/utils/usePagination'
import Avatar from '@pn/components/global/Avatar'
import RenderPrivate,{RenderSuspend} from './PrivateUser'
import { ucwords } from '@pn/utils/Main'
import {ListSkeleton} from '@pn/components/global/Skeleton'
import {TabBarHeight,HeaderHeight,ContentMinHeight} from './utils'
import Pressable from '@pn/components/global/Pressable'
import { Portal } from '@gorhom/portal'
import { MenuContainer } from '@pn/components/global/MoreMenu'
import Backdrop from '@pn/components/global/Backdrop'
import { AuthContext } from '@pn/provider/Context'
import useAPI from '@pn/utils/API'

const winHeight = Dimensions.get('window').height;
const OptionIcon=React.memo((props)=><Icon {...props} name="more-vertical" />)
const MemoAvatar=React.memo(({name,image})=>(
    <Avatar style={{marginRight:10}} {...(image !== null ? {src:`${image}&size=50&watermark=no`} : {name:ucwords(name)})} size={45} />
))
/*
accessoryRight={(props)=>(
    <TouchableOpacity activeOpacity={0.7} style={{padding:5}} onPress={()=>onOpen(item)}><Icon {...props} name="more-vertical" /></TouchableOpacity>
)}
*/
const RenderIcon=React.memo(({item,onOpen})=>{
    const theme = useTheme();
    return (
        <View style={{borderRadius:22,overflow:'hidden'}}>
            <Pressable style={{padding:10}} onPress={()=>onOpen(item)}>
                <OptionIcon style={{width:24,height:24,tintColor:theme['text-hint-color']}} />
            </Pressable>
        </View>
    )
})
const RenderUser=React.memo(({item,index,onOpen})=>{
    const navigation=useNavigation();

    return (
        <ListItem
            key={index.toString()}
            title={item?.name}
            description={`@${item?.username}`}
            accessoryLeft={()=><MemoAvatar name={item?.name} image={item?.image} />}
            accessoryRight={()=><RenderIcon item={item} onOpen={onOpen} />}
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
    const context = React.useContext(AuthContext);
    const {setNotif,state:{user}} = context;
    const {PNpost} = useAPI()
    const {data:dt,error:err,...swrProps} = usePagination(props.data && !props?.data?.users?.private && !props?.data?.users?.suspend ? `/user/${props.data?.users?.username}/${props.type}` : null,props.type,20,false)
    const theme=useTheme()
    const navigation=useNavigation();
    return <RenderFollowClass user={user} ref={ref} {...props} theme={theme} {...swrProps} dt={dt} err={err} navigation={navigation} setNotif={setNotif} PNpost={PNpost} />
})

class RenderFollowClass extends React.PureComponent{
    constructor(props){
        super(props)
        this.refresh=this.refresh.bind(this)
        this.loadMore=this.loadMore.bind(this)
        this.state={
            refreshing:false,
            menu:null,
            loading:false
        }
    }

    handleOpenMenu = (item)=>{
        this.setState({menu:item})
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

    handleFollow(menu){
        const {PNpost,setNotif,mutate} = this.props;
        this.setState({loading:true})
        console.log(menu)
        PNpost(`/backend/follow`,{token:menu?.token_follow}).then((res)=>{
            if(!res.error){
                setNotif(false,"Success!",res?.msg);
                mutate();
            }
        })
        .finally(()=>{
            this.setState({loading:false})
        })
    }

    renderFooter(){
        const {isReachingEnd,isLoadingMore}=this.props;
        if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:10,textAlign:'center'}}>You have reach the bottom of the page</Text>
        if(isLoadingMore) return <View paddingTop={20}><ListSkeleton height={250} number={3} image /></View>
        return null
    }

    render(){
        const {menu,loading}=this.state;
        const {navigation,user,data,error,theme,dt,isValidating,isLoadingInitialData,onGetRef,scrollY,onMomentumScrollBegin,onMomentumScrollEnd,onScrollEndDrag}=this.props

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
            <>
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

                <Backdrop loading visible={loading} />

                <Portal>
                    <MenuContainer
                        visible={menu !== null}
                        onClose={()=>this.setState({menu:null})}
                        type="user"
                        item_id={menu?.id}
                        share={{
                            link:`/user/${menu?.username}`,
                            title:`${menu?.name} (@${menu?.username}) - Portalnesia`
                        }}
                        menu={[{
                            title:ucwords(`${i18n.t('open')} ${i18n.t('profile')}`),
                            onPress:()=>navigation.push("User",{username:menu?.username}),
                            icon:"person"
                        },...(!user || user && user?.id != menu?.id ? [
                            {
                                title:ucwords(i18n.t(menu?.isFollowing ? 'unfollow' : 'follow')),
                                onPress:()=>this.handleFollow(menu),
                                icon:menu?.isFollowing ? "minus-circle" : "plus-circle",
                                ...(menu?.isFollowing ? {color:theme['color-danger-500']} : {})
                            },{
                                title:i18n.t('report'),
                                action:'report'
                            }
                        ] : [])
                        ]}
                    />
                </Portal>
            </>
        )
    }
}

export default RenderFollow