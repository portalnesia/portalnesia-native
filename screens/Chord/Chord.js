import React from 'react';
import { Animated,RefreshControl,View,useWindowDimensions,FlatList } from 'react-native';
import {Layout as Lay,Text,Card,Tab,useTheme,Divider} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'
import {TabView,TabBar} from 'react-native-tab-view'

import {linkTo} from '@pn/navigation/useRootNavigation'
import Layout from '@pn/components/global/Layout';
import Header,{useHeader,headerHeight as headerHeightt,Lottie} from '@pn/components/navigation/Header'
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Skeleton from '@pn/components/global/Skeleton'
import i18n from 'i18n-js'
import {FeedbackToggle} from '@pn/components/global/MoreMenu'
import Carousel from '@pn/components/global/Carousel';
import useSWR from '@pn/utils/swr';

const RenderCaraousel = React.memo(({item, index:i}) => {
	return (
		<Card key={i} onPress={()=>pushTo(`/chord/${item?.slug}`)}>
			<Text category="p1" style={{fontWeight:"600"}}>{`${item?.artist} - ${item?.title}`}</Text>
            <Text category="label" style={{marginTop:10}}>{item?.original}</Text>
		</Card>
	);
})

const useRecommend=()=>useSWR('/chord/recommend')

const RenderRecommend=React.memo(({swr})=>{
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
					renderItem={(props)=><RenderCaraousel {...props} />}
					autoplay
				/>
			) : (
				<Text style={{paddingHorizontal:15}}>No posts</Text>
			)}
			<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
		</Lay>
	)
})

const Recent=({headerHeight,navigation,...other})=>{
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/chord?type=recent","chord",20,false)
	const {width}=useWindowDimensions()
	const ref = React.useRef(null)
	useScrollToTop(ref)

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const _renderItem=({item,index})=>{
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
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(`/chord/${item?.slug}`)}>
							<Text category="p1">{`${item.artist} - ${item.title}`}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(`/chord/${data[index+1]?.slug}`)}>
								<Text category="p1">{`${data[index+1].artist} - ${data[index+1].title}`}</Text>
							</Card>
						)}
					</View>

				</React.Fragment>
			)
		} else return null
	}

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore && data?.length > 0) return <View style={{paddingTop:20,height:'100%'}}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View> 
		else return null
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	}

	return (
		<Animated.FlatList
			ListEmptyComponent={renderEmpty}
			columnWrapperStyle={{flexWrap:'wrap',flex:1}}
			contentContainerStyle={{paddingTop: headerHeight+8,...(error ? {flex:1} : {})}}
			numColumns={2}
			data={data}
			ref={ref}
			renderItem={_renderItem}
			ListHeaderComponent={()=><RenderRecommend />}
			//keyExtractor={(item, index) => `list-item-${index}-${item.color}`}
			ListFooterComponent={Footer}
			//onEndReachedThreshold={0.01}
			refreshControl={
				<RefreshControl
					style={{zIndex:2}}
					colors={['white']}
					progressBackgroundColor="#2f6f4e"
					progressViewOffset={headerHeight}
					onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
					refreshing={refreshing}
				/>	
			}
			onEndReached={()=>{
				if(!isLoadingMore) {
					setSize(size+1)
				}
			}}
			{...other}
		/>
	)
}

const Popular=({headerHeight,navigation,...other})=>{
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/chord?type=popular","chord",20,false)
	const {width}=useWindowDimensions()
	const ref = React.useRef(null)
	useScrollToTop(ref)

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const _renderItem=({item,index})=>{
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
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(`/chord/${item?.slug}`)}>
							<Text category="p1">{`${item.artist} - ${item.title}`}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(`/chord/${data[index+1]?.slug}`)}>
								<Text category="p1">{`${data[index+1].artist} - ${data[index+1].title}`}</Text>
							</Card>
						)}
					</View>

				</React.Fragment>
			)
		} else return null
	}

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View>
		else return null
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	}

	return (
		<Animated.FlatList
			columnWrapperStyle={{flexWrap:'wrap',flex:1}}
			ListEmptyComponent={renderEmpty}
			contentContainerStyle={{paddingTop: headerHeight+8,...(error ? {flex:1} : {})}}
			numColumns={2}
			data={data}
			ref={ref}
			renderItem={_renderItem}
			ListHeaderComponent={()=><RenderRecommend />}
			//keyExtractor={(item, index) => `list-item-${index}-${item.color}`}
			ListFooterComponent={Footer}
			//onEndReachedThreshold={0.02}
			refreshControl={
				<RefreshControl
					colors={['white']}
					progressBackgroundColor="#2f6f4e"
					progressViewOffset={headerHeight}
					onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
					refreshing={refreshing}
				/>	
			}
			onEndReached={()=>{
				if(!isLoadingMore) {
					setSize((a)=>a+1)
				}
			}}
			{...other}
		/>
	)
}



export default function ({ navigation,route }) {
	const slug = route?.params?.slug
	const [tabIndex,setTabIndex] = React.useState(typeof slug === 'string' && slug === 'popular' ? 1 : 0);
	const [routes]=React.useState([
        {key:'recent',title:i18n.t('recent')},
        {key:'popular',title:i18n.t('popular')},
    ])
	const theme = useTheme()
	const {translateY,...other}=useHeader()
	const {width}=useWindowDimensions()
	const headerHeight={...headerHeightt,sub:46}
	const heightHeader = headerHeight?.main + headerHeight?.sub

	const renderTabBar=(props)=>{
		
		return (
			<Animated.View testID="Test-Header-Chord" style={{zIndex: 1,position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,top:0,width: '100%',transform: [{translateY}]}}>
				<Header title="Chord" navigation={navigation} height={56} menu={()=><FeedbackToggle link={`/chord${tabIndex === 1 ? "/popular" : ""}`} />}>
					<TabBar
						{...props}
						style={{height:46,elevation:0,shadowOpacity:0,backgroundColor:theme['background-basic-color-1']}}
						indicatorStyle={{backgroundColor:theme['color-indicator-bar'],height:3}}
						renderLabel={({route,focused})=>{
							return <Text appearance={focused ? 'default' : 'hint'}>{route.title||""}</Text>
						}}
						pressColor={theme['color-control-transparent-disabled']}
                    	pressOpacity={0.8}
					/>
				</Header>
			</Animated.View>
		)
	}

	const renderScene=({route})=>{
        if(route.key == 'recent') return <Recent headerHeight={heightHeader} {...other} navigation={navigation} />
        if(route.key == 'popular') return <Popular headerHeight={heightHeader} {...other} navigation={navigation} />
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

	return (
		<Layout navigation={navigation}>
			{renderTabView()}
		</Layout>
	);
}