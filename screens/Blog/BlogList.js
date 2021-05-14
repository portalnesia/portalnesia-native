import React from 'react';
import {  View,FlatList,useWindowDimensions,RefreshControl,Image } from 'react-native';
import {Layout as Lay,Text,Button,Card,Spinner} from '@ui-kitten/components'
import Skeleton from '@pn/components/global/Skeleton'

import {linkTo} from '@pn/navigation/useRootNavigation'
//import Carousel from '@pn/components/global/Carousel';
import Layout from '@pn/components/global/Layout';
import usePagination from '@pn/utils/usePagination'
//import Image from '@pn/components/global/Image'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {ucwords} from '@pn/utils/Main'
import i18n from 'i18n-js'
import {FeedbackToggle} from '@pn/components/global/MoreMenu'

export default function BlogList({navigation,route}){
    const { width } = useWindowDimensions();
    const {blogType,slug} = route.params;

	const {
		data,
		error,
		isLoadingMore,
		size,
		setSize,
		isReachingEnd,
		mutate,isValidating
	} = usePagination(`/blog/${blogType}/${slug}`,"blog",15,false)

	const [refreshing,setRefreshing]=React.useState(false)

	React.useEffect(()=>{
		if(!isValidating) setRefreshing(false);
	},[isValidating])

	const Footer=React.useCallback(()=>{
		if(isReachingEnd) return <Text style={{marginTop:10,marginBottom:40,textAlign:'center'}}>{i18n.t('reach_end')}</Text>
		if(isLoadingMore) return <View paddingTop={20}><Skeleton type="grid" number={4} image /></View> 
		else return null
	},[isReachingEnd,isLoadingMore])


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
						<Card key={`card-0-${index}`} style={{width:cardSize,margin:5,marginRight:2}} onPress={()=>navigation.push("BlogDetail",{slug:item?.slug})} header={(props)=>(
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
							<Text category="label" appearance="hint" style={{marginTop:10}}>{item.users?.name}</Text>
							<Text category="label" appearance="hint" style={{fontSize:10}}>{item.date}</Text>
						</Card>
						{data?.[index+1]?.id && (
							<Card key={`card-1-${index}`} style={{width:cardSize,margin:5,marginLeft:2}} onPress={()=>navigation.push("BlogDetail",{slug:data[index+1]?.slug})} header={(props)=>(
								<View {...props} {...props} style={{...props?.style,padding:0}}>
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
								<Text category="label" appearance="hint" style={{marginTop:10}}>{data[index+1]?.users?.name}</Text>
								<Text category="label" appearance="hint" style={{fontSize:10}}>{data[index+1].date}</Text>
							</Card>
						)}
					</View>
				</React.Fragment>
			)
		} else {
			return null
		}
	}

	const renderEmpty=()=>{
		if(error) return <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
		return <View style={{height:'100%'}}><Skeleton type="grid" number={4} image /></View>
	}

    return (
		<Layout navigation={navigation} title={`${ucwords(blogType)} - Blog`} subtitle={ucwords(slug.replace(/\-/g," "))} menu={()=><FeedbackToggle />}>
			{['tags','category'].indexOf(blogType) === -1 ? (
                <Lay level="2" style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>{i18n.t('errors.general')}</Text></Lay>
            ) : (
				<Lay style={{paddingBottom:60,flexGrow:1,alignItems:'center',justifyContent:'center',flexDirection:'column'}} level="2">
					<FlatList
						ListEmptyComponent={renderEmpty}
						columnWrapperStyle={{flexWrap:'wrap',flex:1}}
						contentContainerStyle={{
							...(error ? {flex:1} : {})
						}}
						numColumns={2}
						data={data}
						renderItem={renderNews}
						ListFooterComponent={Footer}
						refreshControl={
							<RefreshControl
								colors={['white']}
								progressBackgroundColor="#2f6f4e"
								onRefresh={()=>{!isValidating && (setRefreshing(true),mutate())}}
								refreshing={refreshing}
							/>
						}
						onEndReachedThreshold={0.01}
						onEndReached={()=>{
							if(!isReachingEnd && !isLoadingMore) {
								setSize(size+1)
							}
						}}
					/>
				</Lay>
			)}
		</Layout>
	);
}