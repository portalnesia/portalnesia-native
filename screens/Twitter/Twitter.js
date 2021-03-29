import React from 'react';
import { Animated,RefreshControl,View,useWindowDimensions } from 'react-native';
import {Layout as Lay,Text,Card,Tab,TabBar,useTheme,ViewPager} from '@ui-kitten/components'

import Layout from '@pn/components/global/Layout';
import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
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
	} = usePagination("/twitter","recent",20,false,false)
	const {width}=useWindowDimensions()

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
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" number={4} gridStyle={{marginBottom:20}} /></View>
		else return null
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
							onRefresh={()=>mutate()}
							refreshing={(isValidating && !isLoadingMore) || isLoadingInitialData}
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
	} = usePagination("/twitter","popular",20,false,false)
	const {width}=useWindowDimensions()

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
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" number={4} gridStyle={{marginBottom:20}} /></View>
		else return null
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
							onRefresh={()=>mutate()}
							refreshing={(isValidating && !isLoadingMore) || isLoadingInitialData}
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
	const [selectedIndex, setSelectedIndex] = React.useState(typeof slug === 'string' && slug === 'popular' ? 1 : 0);
	const shouldLoadComponent = (index) => index === selectedIndex;
	const theme = useTheme()
	const {translateY,...other} = useHeader()	
	const heightHeader = headerHeight?.main + headerHeight?.sub

	return (
		<Layout navigation={navigation}>
			<Animated.View style={{position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,right: 0,width: '100%',zIndex: 1,transform: [{translateY}]}}>
				<Header title="Twitter Thread Reader" navigation={navigation} height={56} withBack>
					<TabBar
						selectedIndex={selectedIndex}
						onSelect={index => setSelectedIndex(index)}
						style={{flex:1,height:headerHeight?.sub}}
					>
						<Tab title='RECENT' />
						<Tab title='POPULAR' />
					</TabBar>
				</Header>
			</Animated.View>
			<ViewPager
				selectedIndex={selectedIndex}
				onSelect={index => setSelectedIndex(index)}
				shouldLoadComponent={shouldLoadComponent}
				style={{flex:1,alignItems:'center',justifyContent:'center'}}
			>
				<Lay level="2">
					<Recent headerHeight={heightHeader} {...other} navigation={navigation} />
				</Lay>
				<Lay level="2">
					<Popular headerHeight={heightHeader} {...other} navigation={navigation} />
				</Lay>
			</ViewPager>
		</Layout>
	);
}