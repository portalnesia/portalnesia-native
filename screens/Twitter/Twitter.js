import React from 'react';
import { Animated,RefreshControl,View,useWindowDimensions } from 'react-native';
import {Layout as Lay,Text,Card,Tab,useTheme} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'

import Layout from '@pn/components/global/Layout';
import Header,{useHeader,headerHeight as headerHeightt} from '@pn/components/navigation/Header'
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {specialHTML} from '@pn/utils/Main'
import Skeleton from '@pn/components/global/Skeleton'

const Recent=({headerHeight,navigation,...other})=>{
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating,isLoadingInitialData
	} = usePagination("/twitter?type=recent","data",20,false,false)
	const {width}=useWindowDimensions()

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const _renderItem=({item,index})=>{
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
	}

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View style={{paddingTop:20,height:'100%'}}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View> 
		else return null
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('error')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	}

	return (
		<>
			{isLoadingInitialData ? (
				<View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
			) : error ? (
				<Lay style={{paddingBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
					<Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Something went wrong</Text></Lay>
				</Lay>
			) : (
				<Animated.FlatList
					columnWrapperStyle={{flexWrap:'wrap',flex:1}}
					ListEmptyComponent={renderEmpty}
					contentContainerStyle={{paddingTop: headerHeight+8}}
					numColumns={2}
					data={data}
					renderItem={_renderItem}
					//keyExtractor={(item, index) => `list-item-${index}-${item.color}`}
					ListFooterComponent={Footer}
					//onEndReachedThreshold={0.05}
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
						if(!isLoadingMore) setSize(size+1)
					}}
					{...other}
				/>
			)}
		</>
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
		mutate,isValidating,isLoadingInitialData
	} = usePagination("/twitter?type=popular","data",20,false,false)
	const {width}=useWindowDimensions()

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
	}

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton height={200} type="grid" number={4} gridStyle={{marginBottom:20}} /></View>
		else return null
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('error')}</Text></Lay>
		return <View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
	}

	return (
		<>
			{isLoadingInitialData ? (
                <View style={{height:"100%",paddingTop:headerHeight+8}}><Skeleton type="grid" number={14} gridStyle={{marginBottom:40}} /></View>
			) : error ? (
				<Lay style={{marginBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
					<Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Something went wrong</Text></Lay>
				</Lay>
			) : (
				<Animated.FlatList
					columnWrapperStyle={{flexWrap:'wrap',flex:1}}
					ListEmptyComponent={renderEmpty}
					contentContainerStyle={{paddingTop: headerHeight+8}}
					numColumns={2}
					data={data}
					renderItem={_renderItem}
					//keyExtractor={(item, index) => `list-item-${index}-${item.color}`}
					ListFooterComponent={Footer}
					//onEndReachedThreshold={0.05}
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
						if(!isLoadingMore) setSize(size+1)
					}}
					{...other}
				/>
			)}
		</>
	)
}



export default function ({ navigation,route }) {
	const slug = route?.params?.slug
	const [tabIndex,setTabIndex] = React.useState(typeof slug === 'string' && slug === 'popular' ? 1 : 0);
	const [routes]=React.useState([
        {key:'recent',title:"Recent"},
        {key:'popular',title:"Popular"},
    ])
	const theme = useTheme()
	const {translateY,...other}=useHeader()
	const {width}=useWindowDimensions()
	const headerHeight={...headerHeightt,sub:46}
	const heightHeader = headerHeight?.main + headerHeight?.sub

	const renderTabBar=(props)=>{
		
		return (
			<Animated.View style={{zIndex: 1,position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,top:0,width: '100%',transform: [{translateY}]}}>
				<Header title="Twitter Thread Reader" navigation={navigation} height={56} withBack>
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