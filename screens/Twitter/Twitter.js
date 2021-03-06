import React from 'react';
import { Animated,RefreshControl,View,Dimensions } from 'react-native';
import {Layout as Lay,Text,Card,Tab,useTheme,Input,Icon,Divider} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'
import i18n from 'i18n-js'
import Modal from 'react-native-modal'
import {linkTo} from '@pn/navigation/useRootNavigation'

import {getCollapsOpt} from '@pn/utils/Main'
import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import Pressable from '@pn/components/global/Pressable'
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {isTwitterURL, isURL, specialHTML} from '@portalnesia/utils'
import Skeleton from '@pn/components/global/Skeleton'
import useAPI from '@pn/utils/API'
import Portalnesia from '@portalnesia/react-native-core'
import { AuthContext } from '@pn/provider/Context';
import Carousel from '@pn/components/global/Carousel';
import useSWR from '@pn/utils/swr';
import {MenuToggle,MenuContainer} from '@pn/components/global/MoreMenu'
import ShareModule from '@pn/module/Share';
import {useCollapsibleHeader} from 'react-navigation-collapsible'

const headerHeight = 46;
const {width} = Dimensions.get('window')

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>linkTo(`/twitter/thread/${item?.id}`)}>
			<Text category="p1" style={{fontWeight:"600"}}>{specialHTML(item?.title)}</Text>
            <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${item?.screen_name}`}</Text>
		</Card>
	);
})
const renderCarousel=(props)=><RenderCaraousel {...props} />

const useRecommend=()=>useSWR('/twitter/recommend')

const RenderRecommend=React.memo(()=>{
	const {data,error,mutate} = useRecommend();
	const theme = useTheme();
	
	React.useEffect(()=>{
		mutate();
	},[])
	return (
		<Lay level="2" style={{paddingTop:15}}>
			<Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended')}</Text>
			{(!data && !error) ? <View style={{paddingHorizontal:15}}><Skeleton type='caraousel' height={100} /></View>
			: error || data?.error==1 ? (
				<Text style={{paddingHorizontal:15}}>Failed to load data</Text>
			) : data?.recommend?.length > 0 ? (
				<Carousel
					data={data?.recommend}
					renderItem={renderCarousel}
					autoplay
				/>
			) : (
				<Text style={{paddingHorizontal:15}}>No posts</Text>
			)}
			<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
		</Lay>
	)
})
const renderRecommend=()=><RenderRecommend />

const RenderInput=React.memo(({onClose,initialData=""})=>{
	const [input,setInput]=React.useState("")
    const [loading,setLoading]=React.useState(false);
    const [result,setResult]=React.useState(null)
	const theme = useTheme();
	const context = React.useContext(AuthContext)
	const {setNotif} = context;
	const {PNpost} = useAPI();

	React.useEffect(()=>{
		if(initialData?.length > 0) {
			setInput(initialData);
			setTimeout(()=>handleSubmit(initialData),500);
		}
	},[initialData])

	const handleSubmit=(input)=>{
		if(isURL(input) && isTwitterURL(input)) {
			Portalnesia.Safetynet.verifyWithRecaptcha()
			.then(async(recaptcha)=>{
				setLoading(true)
				return await PNpost(`/twitter/thread`,{url:input,recaptcha},undefined,true,false)
			})
			.then((res)=>{
				if(!res?.error) {
					setInput("");
					setResult(res?.data);
				}
			})
			.catch((e)=>{
				setNotif(true,"Error",e?.message);
			})
			.finally(()=>{
				setLoading(false)
			})
		} else {
			setNotif(true,"Error",i18n.t("errors.invalid",{type:i18n.t('url')}));
		}
	}

	const handleTo = ()=>{
		onClose && onClose();
		linkTo(`/twitter/thread/${result?.id}`)
	}

	return (
		<Lay style={{padding:10,width:width-20,borderRadius:10}}>
			<View style={{marginBottom:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
				<Text>{i18n.t("new_type",{type:i18n.t('twitter_thread')})}</Text>
				<View style={{borderRadius:22,overflow:'hidden'}}>
					<Pressable style={{padding:10}} onPress={()=> onClose && onClose()}>
						<Icon style={{width:24,height:24,tintColor:theme['text-hint-color']}} name="close-outline" />
					</Pressable>
				</View>
			</View>
			<Input
				placeholder="https://twitter.com/...."
                value={input}
				label="Twitter Thread URL"
                onChangeText={setInput}
				returnKeyType="send"
				disabled={loading}
				autoCapitalize="none"
				onSubmitEditing={()=>handleSubmit(input)}
			/>
			<View style={{marginTop:10}}>
				<Button disabled={loading} loading={loading} onPress={()=>handleSubmit(input)}>Submit</Button>
			</View>
			{result !== null && (
				<View>
					<Divider style={{marginVertical:15,backgroundColor:theme['border-text-color']}} />
					<Card onPress={handleTo}>
						<Text category="p1">{specialHTML(result?.tweet)}</Text>
					</Card>
				</View>
			)}
		</Lay>
	)
})

const Recent=({headerHeight,navigation,onScroll,containerPaddingTop,scrollIndicatorInsetTop})=>{
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/twitter?type=recent","data",20,false)

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const _renderItem=React.useCallback(({item,index})=>{
		const angka = index % 2;
		const ads = index % 28;
		const cardSize=(width/2)-7
		if(angka===0) {
			return (
				<React.Fragment key={`fragment-${index}`}>
					{ads === 0 ? (
						<View key={`ads-1-${index}`}>
							<AdsBanner />
						</View>
					) : ads === 14 ? (
						<View key={`ads-2-${index}`}>
							<AdsBanners />
						</View>
					) : null}
					<View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation?.navigate("TwitterThread",{slug:item?.id})}>
							<Text category="p1">{specialHTML(item?.title)}</Text>
                            <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${item?.screen_name}`}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation?.navigate("TwitterThread",{slug:data[index+1]?.id})}>
								<Text category="p1">{specialHTML(data[index+1].title)}</Text>
                                <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${data[index+1]?.screen_name}`}</Text>
							</Card>
						)}
					</View>

				</React.Fragment>
			)
		} else return null
	},[width,data])

	const Footer=React.useCallback(()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View style={{paddingTop:20,height:'100%'}}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View> 
		else return null
	},[isReachingEnd,isLoadingMore,data])

	const renderEmpty=React.useCallback(()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+containerPaddingTop}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	},[error])

	return (
		<Animated.FlatList
			columnWrapperStyle={{flexWrap:'wrap',flex:1}}
			ListEmptyComponent={renderEmpty}
			contentContainerStyle={{paddingTop: containerPaddingTop + headerHeight,...(error ? {flex:1} : {})}}
			scrollIndicatorInsets={{top: scrollIndicatorInsetTop + headerHeight}}
			numColumns={2}
			data={data}
			renderItem={_renderItem}
			ListFooterComponent={Footer}
			ListHeaderComponent={renderRecommend}
			refreshControl={
				<RefreshControl
					colors={['white']}
					progressBackgroundColor="#2f6f4e"
					progressViewOffset={headerHeight+containerPaddingTop}
					onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
					refreshing={refreshing}
				/>	
			}
			onEndReached={()=>{
				if(!isLoadingMore) setSize(size+1)
			}}
			onScroll={onScroll}
		/>
	)
}

const Popular=({headerHeight,navigation,onScroll,containerPaddingTop,scrollIndicatorInsetTop})=>{
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/twitter?type=popular","data",20,false)

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const _renderItem=React.useCallback(({item,index})=>{
		const angka = index % 2;
		const ads = index % 40;
		const cardSize=(width/2)-7
		if(angka===0) {
			return (
				<React.Fragment key={`fragment-${index}`}>
					{ads === 0 ? (
						<View key={`ads-1-${index}`}>
							<AdsBanner />
						</View>
					) : ads === 20 ? (
						<View key={`ads-2-${index}`}>
							<AdsBanners />
						</View>
					) : null}
					<View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation?.navigate("TwitterThread",{slug:item?.id})}>
							<Text category="p1">{specialHTML(item?.title)}</Text>
                            <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${item?.screen_name}`}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation?.navigate("TwitterThread",{slug:data[index+1]?.id})}>
								<Text category="p1">{specialHTML(data[index+1].title)}</Text>
                                <Text appearance="hint" category="label" style={{marginTop:10}}>{`Thread by @${data[index+1]?.screen_name}`}</Text>
							</Card>
						)}
					</View>

				</React.Fragment>
			)
		} else return null
	},[width,data])

	const Footer=React.useCallback(()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View>
		else return null
	},[isReachingEnd,isLoadingMore,data])

	const renderEmpty=React.useCallback(()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+containerPaddingTop}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	},[error])

	return (
		<Animated.FlatList
			columnWrapperStyle={{flexWrap:'wrap',flex:1}}
			ListEmptyComponent={renderEmpty}
			contentContainerStyle={{paddingTop: containerPaddingTop + headerHeight,...(error ? {flex:1} : {})}}
			scrollIndicatorInsets={{top: scrollIndicatorInsetTop + headerHeight}}
			numColumns={2}
			data={data}
			renderItem={_renderItem}
			ListHeaderComponent={renderRecommend}
			//keyExtractor={(item, index) => `list-item-${index}-${item.color}`}
			ListFooterComponent={Footer}
			//onEndReachedThreshold={0.05}
			refreshControl={
				<RefreshControl
					colors={['white']}
					progressBackgroundColor="#2f6f4e"
					progressViewOffset={headerHeight+containerPaddingTop}
					onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
					refreshing={refreshing}
				/>	
			}
			onEndReached={()=>{
				if(!isLoadingMore) setSize(size+1)
			}}
			onScroll={onScroll}
		/>
	)
}



export default function ({ navigation,route }) {
	const initialType = route.params?.initialType;
    const initialData = route.params?.initialData;
	const slug = route?.params?.slug
	const [tabIndex,setTabIndex] = React.useState(typeof slug === 'string' && slug === 'popular' ? 1 : 0);
	const [routes]=React.useState([
        {key:'recent',title:i18n.t('recent')},
        {key:'popular',title:i18n.t('popular')},
    ])
	const theme = useTheme()
	const [open,setOpen]=React.useState(false);
	const [menu,setMenu]=React.useState(false)
	const [input,setInput] = React.useState("");

	const {onScroll,containerPaddingTop,scrollIndicatorInsetTop,translateY} = useCollapsibleHeader(getCollapsOpt(theme,false))

	const renderTabBar=(props)=>{
		
		return (
			<Animated.View style={{zIndex: 1,position:'absolute',backgroundColor: theme['background-basic-color-1'],height:headerHeight,top:containerPaddingTop,width: '100%',elevation:5,transform: [{translateY}]}}>
				<TabBar
					{...props}
					style={{backgroundColor:theme['background-basic-color-1']}}
					indicatorStyle={{backgroundColor:theme['color-indicator-bar'],height:3}}
					renderLabel={({route,focused})=>{
						return <Text appearance={focused ? 'default' : 'hint'}>{route.title||""}</Text>
					}}
					pressColor={theme['color-control-transparent-disabled']}
					pressOpacity={0.8}
				/>
			</Animated.View>
		)
	}

	const renderScene=({route})=>{
        if(route.key == 'recent') return <Recent headerHeight={headerHeight} onScroll={onScroll} containerPaddingTop={containerPaddingTop} scrollIndicatorInsetTop={scrollIndicatorInsetTop} navigation={navigation} />
        if(route.key == 'popular') return <Popular headerHeight={headerHeight} onScroll={onScroll} containerPaddingTop={containerPaddingTop} scrollIndicatorInsetTop={scrollIndicatorInsetTop} navigation={navigation} />
        return null;
    }

	const renderTabView=()=>{
        return (
            <TabView
                onIndexChange={(index)=>setTabIndex(index)}
                navigationState={{index:tabIndex,routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                initialLayout={{height:0,width}}
                lazy
            />
        )
    }
	
	React.useEffect(()=>{
        const dataListener = (data)=>{
            if(typeof data?.data === 'string' && typeof data?.mimeType === 'string') {
                if(data?.mimeType==='text/plain') {
                    setInput(data?.data);
					setOpen(true)
                }
            }
        }
        ShareModule.getSharedData().then(dataListener).catch(console.log)
		ShareModule.addListener(dataListener)

		return ()=>ShareModule.removeListener(dataListener);
    },[])

	const menuToggle=React.useCallback(()=> <MenuToggle onPress={()=>{setMenu(true)}} />,[]);

	return (
		<Layout title="Twitter Thread Reader" navigation={navigation} withBack menu={menuToggle} >
			{renderTabView()}
			<MenuContainer
				visible={menu}
				onClose={()=>setMenu(false)}
				share={{
                    link:`/twitter/thread${tabIndex === 1 ? "/popular" : ""}`,
				}}
				menu={[{
					title:`${i18n.t("new_type",{type:i18n.t('twitter_thread')})}`,
					onPress:()=>setOpen(true),
					icon:"plus-square"
				},{
					title:i18n.t('feedback'),
					action:'feedback'
				}]}
			/>
			<Modal
                isVisible={open}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
				coverScreen={false}
            >
				<RenderInput onClose={()=>setOpen(false)} initialData={input} />
			</Modal>
		</Layout>
	);
}