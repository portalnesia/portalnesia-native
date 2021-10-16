import React from 'react';
import {  View,FlatList,useWindowDimensions,RefreshControl } from 'react-native';
import {Layout as Lay,Text,Card} from '@ui-kitten/components'
import Image from '@pn/module/FastImage'
import i18n from 'i18n-js'

import Layout from '@pn/components/global/Layout';
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import Skeleton from '@pn/components/global/Skeleton'
import {FeedbackToggle} from '@pn/components/global/MoreMenu'

export default function Twibbon({ navigation }) {
	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination("/twibbon","twibbon",12)
	const {width}=useWindowDimensions()

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const Footer=React.useCallback(()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore && data?.length > 0) return <View paddingTop={20}><Skeleton type="grid" height={300} number={2} image /></View> 
		else return null
	},[isReachingEnd,isLoadingMore,data])

	const renderTwibbon=React.useCallback(({item,index})=>{
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
						<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.navigate("TwibbonDetail",{slug:item?.slug})} header={(props)=>(
							<View {...props} style={{...props?.style,padding:0,height:cardSize,width:cardSize}}>
                                <Image
									style={{
										height:cardSize,
										width:cardSize,
                                        position:'absolute',
                                        top:0,
                                        left:0
									}}
									source={require('@pn/assets/transparent.png')}
								/>
								<Image
									style={{
										height:cardSize,
										width:cardSize,
                                        position:'absolute',
                                        top:0,
                                        left:0
									}}
									source={{uri:item.image}}
								/>
							</View>
						)}>
							<Text category="p1">{item.title}</Text>
							<Text category="label" appearance="hint" style={{marginTop:10}}>{`By ${item?.users?.name}`}</Text>
							<Text category="label" appearance="hint" style={{fontSize:10}}>{item?.date}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={1} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>navigation.navigate("TwibbonDetail",{slug:data?.[index+1]?.slug})} header={(props)=>(
								<View {...props} style={{...props?.style,padding:0,height:cardSize,width:cardSize}}>
									<Image
                                        style={{
                                            height:cardSize,
                                            width:cardSize,
                                            position:'absolute',
                                            top:0,
                                            left:0
                                        }}
                                        source={require('@pn/assets/transparent.png')}
                                    />
                                    <Image
										style={{
											height:cardSize,
											width:cardSize,
                                            position:'absolute',
                                            top:0,
                                            left:0
										}}
										source={{uri:data[index+1].image}}
									/>
								</View>
							)}>
								<Text category="p1">{data[index+1].title}</Text>
								<Text category="label" appearance="hint" style={{marginTop:10}}>{`By ${data[index+1].users?.name}`}</Text>
								<Text category="label" appearance="hint" style={{fontSize:10}}>{data[index+1].date}</Text>
							</Card>
						)}
					</View>
				</React.Fragment>
			)
		} else {
			return null
		}
	},[width,data])

	const renderEmpty=React.useCallback(()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:'100%'}}><Skeleton type="grid" number={8} image /></View>
	},[error])

	const feedbackToggle=React.useCallback(()=><FeedbackToggle link="/twibbon" />,[])

	return (
		<Layout navigation={navigation} title="Twibbon" withBack menu={feedbackToggle}>
			<FlatList
				columnWrapperStyle={{flexWrap:'wrap',flex:1}}
				ListEmptyComponent={renderEmpty}
				contentContainerStyle={{
					...(error ? {flex:1} : {})
				}}
				data={data}
				renderItem={renderTwibbon}
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
				onEndReached={()=>{
					if(!isReachingEnd && !isLoadingMore) {
						setSize(size+1)
					}
				}}
			/>
		</Layout>
	);
}