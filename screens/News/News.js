import React from 'react';
import {  View,FlatList,RefreshControl,Dimensions } from 'react-native';
import {Layout as Lay,Text,Card, Divider, useTheme} from '@ui-kitten/components'
import {useScrollToTop} from '@react-navigation/native'
import Image from 'react-native-fast-image'
import i18n from 'i18n-js'

import {linkTo} from '@pn/navigation/useRootNavigation'
import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Skeleton from '@pn/components/global/Skeleton'
import {FeedbackToggle} from '@pn/components/global/MoreMenu'
import useSWR from '@pn/utils/swr';

const {width} = Dimensions.get('window')

const RenderRecommend=(({item,index:i})=>{
	return (
		<Card key={i} onPress={()=>linkTo(item?.url?.substring(23))}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 200,
						width: 200,
					}}
					source={{uri:item?.image}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"600"}}>{item.title}</Text>
            <Text category="label" appearance="hint" style={{marginTop:10}}>{item.source}</Text>
            <Text category="label" appearance="hint" style={{fontSize:10}}>{item.date_string}</Text>
		</Card>
	);
})

export default function ({ navigation }) {
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/news","data",24,true,false)
	const {data:dataRecom,error:errorRecom,mutate: mutateRecom} = useSWR("/news/recommend");
	const ref = React.useRef(null)
	useScrollToTop(ref)
	const theme=useTheme();

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const Footer=()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" height={300} number={2} image /></View> 
		else return null
	}

	const renderNews=({item,index})=>{
		const angka = index % 2;
		const ads = index % 20;
		const cardSize=(width/2)-7
		if(angka===0) {
			return (
				<React.Fragment key={`fragment-${index}`}>
					{ads === 0 && index !==0 ? (
						<View key={`ads-1-${index}`}>
							<AdsBanner />
						</View>
					) : ads === 10 && index !==0 ? (
						<View key={`ads-2-${index}`}>
							<AdsBanners />
						</View>
					) : null}
					<View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>linkTo(`/news/${item?.source}/${encodeURIComponent(item?.title)}`)} header={(props)=>(
							<View {...props} style={{...props?.style,padding:0}}>
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
							<Card key={1} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>linkTo(`/news/${data?.[index+1]?.source}/${encodeURIComponent(data?.[index+1]?.title)}`)} header={(props)=>(
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

	const renderHeader=()=>{
		return (
			<Lay level="2">
				<View style={{marginBottom:30}}><AdsBanner /></View>
				<Text category="h5" style={{paddingHorizontal:15,marginBottom:15}}>{i18n.t('recommended')}</Text>
				{(!dataRecom && !errorRecom) ? <View style={{paddingHorizontal:15}}><Skeleton type='caraousel' image height={300} /></View>
				: errorRecom || dataRecom?.error==1 ? (
					<Text style={{paddingHorizontal:15}}>Failed to load data</Text>
				) : dataRecom?.recommend?.length > 0 ? (
					<Carousel
						data={dataRecom?.recommend}
						renderItem={(props)=><RenderRecommend {...props} />}
						autoplay
					/>
				) : (
					<Text style={{paddingHorizontal:15}}>No posts</Text>
				)}
				<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
			</Lay>
		)
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:'100%'}}><Skeleton type="grid" number={8} image /></View>
	}

	React.useEffect(()=>{
		mutateRecom()
	},[])

	return (
		<Layout navigation={navigation} title="News" withBack={false} menu={()=><FeedbackToggle link="/news" />}>
			<Lay style={{paddingBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
				<FlatList
					ListEmptyComponent={renderEmpty}
					columnWrapperStyle={{flexWrap:'wrap',flex:1}}
					contentContainerStyle={{
						...(error ? {flex:1} : {})
					}}
					data={data}
					ListHeaderComponent={renderHeader}
					renderItem={renderNews}
					ListFooterComponent={Footer}
					numColumns={2}
					refreshControl={
						<RefreshControl
							colors={['white']}
							progressBackgroundColor="#2f6f4e"
							onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
							refreshing={refreshing}
						/>
					}
					ref={ref}
					onEndReached={()=>{
						if(!isReachingEnd && !isLoadingMore) {
							setSize(size+1)
						}
					}}
				/>
			</Lay>
		</Layout>
	);
}