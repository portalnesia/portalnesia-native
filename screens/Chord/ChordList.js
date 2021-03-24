import React from 'react';
import { View,useWindowDimensions,FlatList } from 'react-native';
import {Layout as Lay,Text,Card,Spinner,useTheme} from '@ui-kitten/components'

import Layout from '@pn/components/global/Layout';
//import Header,{useHeader,headerHeight} from '@pn/components/navigation/Header'
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import { ucwords } from '@pn/utils/Main';

const RenderChord=React.memo(({item,index,width,data,navigation})=>{
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
					<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.navigate("ChordDetail",{slug:item.slug})}>
						<Text category="p1">{`${item.artist} - ${item.title}`}</Text>
					</Card>
					{data?.[index+1]?.id && (
						<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.navigate("ChordDetail",{slug:data[index+1].slug})}>
							<Text category="p1">{`${data[index+1].artist} - ${data[index+1].title}`}</Text>
						</Card>
					)}
				</View>
			</React.Fragment>
		)
	} else return null
})

const RenderArtist=React.memo(({item,index,width,data,navigation})=>{
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
					<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.push("ChordList",{slug:item.slug_artist})}>
						<Text category="p1">{`${item.artist}`}</Text>
					</Card>
					{data?.[index+1]?.id && (
						<Card key={1} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.push("ChordList",{slug:data[index+1].slug_artist})}>
							<Text category="p1">{`${data[index+1].artist}`}</Text>
						</Card>
					)}
				</View>
			</React.Fragment>
		)
	} else return null
})

export default function ({ navigation,route }) {
	const {slug} = route.params
	const artist = React.useMemo(()=>{
		console.log(slug)
		if(slug) {
			return ucwords(slug.replace(/\-/g," "))
		}
	},[slug])
	const {width}=useWindowDimensions()
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating,isLoadingInitialData
	} = usePagination(`/chord/artist${slug ? `/${slug}` : ""}`,"chord",20,false,false)

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <Lay level="2" style={{flex:1,justifyContent:'center',alignItems:'center',marginBottom:40,marginTop:20}}><Spinner size='giant' /></Lay> 
		else return null
	}

	return (
		<Layout navigation={navigation} title={slug ? `Chord By ${artist}` : "Chord Artists"}>
			<Lay style={{paddingBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
				{isLoadingInitialData ? (
                	<Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Spinner size="giant" /></Lay>
            	) : error ? (
					<Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Something went wrong</Text></Lay>
				) : (
					<FlatList
						columnWrapperStyle={{flexWrap:'wrap',flex:1}}
						numColumns={2}
						data={data}
						renderItem={({item,index})=>{
							if(slug) return <RenderChord item={item} index={index} width={width} data={data} navigation={navigation} />
							else return <RenderArtist item={item} index={index} width={width} data={data} navigation={navigation} />
						}}
						ListFooterComponent={Footer}
						onRefresh={()=>{mutate()}}
						refreshing={(isValidating && !isLoadingMore) || isLoadingInitialData}
						onEndReachedThreshold={0.01}
						onEndReached={()=>{
							if(!isReachingEnd && !isLoadingMore) {
								setSize(size+1)
							}
						}}
					/>
				)}
			</Lay>
		</Layout>
	);
}