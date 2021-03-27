import React from 'react';
import {  View,FlatList,useWindowDimensions } from 'react-native';
import {Layout as Lay,Text,Card} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'

import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import usePagination from '@pn/utils/usePagination'
import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Skeleton from '@pn/components/global/Skeleton'


const renderRecommend=()=>{

}

export default function ({ navigation }) {
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating,isLoadingInitialData
	} = usePagination("/news","data",24,true,false)
	const {width}=useWindowDimensions()
	const ref = React.useRef(null)
	useScrollToTop(ref)

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>You have reach the bottom of the page</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" number={4} image /></View> 
		else return null
	}

	const renderNews=({item,index})=>{
		const angka = index % 2;
		const ads = index % 20;
		const cardSize=(width/2)-7
		if(angka===0) {
			return (
				<React.Fragment key={`fragment-${index}`}>
					{ads === 0 ? (
						<View key={`ads-1-${index}`}>
							<AdsBanner />
						</View>
					) : ads === 10 ? (
						<View key={`ads-2-${index}`}>
							<AdsBanners />
						</View>
					) : null}
					<View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.navigate("Main",{screen:"NewsDetail",params:{source:item?.source,title:encodeURIComponent(item?.title)}})} header={(props)=>(
							<View {...props} {...props} style={{...props?.style,padding:0}}>
								<Image
									style={{
										height:cardSize,
										width:cardSize
									}}
									source={{uri:item.image}}
								/>
							</View>
						)}>
							<Text category="p1">{item.title}</Text>
							<Text category="label" appearance="hint" style={{marginTop:10}}>{item.source}</Text>
							<Text category="label" appearance="hint" style={{fontSize:10}}>{item.date_string}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>navigation.navigate("Main",{screen:"NewsDetail",params:{source:data?.[index+1]?.source,title:encodeURIComponent(data?.[index+1]?.title)}})} header={(props)=>(
								<View {...props} style={{...props?.style,padding:0}}>
									<Image
										style={{
											height:cardSize,
											width:cardSize
										}}
										source={{uri:data[index+1].image}}
									/>
								</View>
							)}>
								<Text category="p1">{data[index+1].title}</Text>
								<Text category="label" appearance="hint" style={{marginTop:10}}>{data[index+1].source}</Text>
								<Text category="label" appearance="hint" style={{fontSize:10}}>{data[index+1].date_string}</Text>
							</Card>
						)}
					</View>
				</React.Fragment>
			)
		} else {
			return null
		}
	}

	return (
		<Layout navigation={navigation} title="News" withBack={false}>
			{isLoadingInitialData ? (
				<View style={{height:'100%'}}><Skeleton type="grid" number={4} image /></View>
			) : (
				<Lay style={{paddingBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
					{error ? (
						<Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Something went wrong</Text></Lay>
					) : (
						<FlatList
							columnWrapperStyle={{flexWrap:'wrap',flex:1}}
							data={data}
							renderItem={renderNews}
							ListFooterComponent={Footer}
							numColumns={2}
							onRefresh={()=>{mutate()}}
							refreshing={(isValidating && !isLoadingMore) || isLoadingInitialData}
							onEndReachedThreshold={0.01}
							ref={ref}
							onEndReached={()=>{
								if(!isReachingEnd && !isLoadingMore) {
									setSize(size+1)
								}
							}}
						/>
					)}
				</Lay>
			)}
		</Layout>
	);
}