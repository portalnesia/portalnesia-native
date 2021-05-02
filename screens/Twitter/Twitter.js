import React from 'react';
import { Animated,RefreshControl,View,Dimensions,ToastAndroid } from 'react-native';
import {Layout as Lay,Text,Card,Tab,useTheme,Input,Icon,Divider} from '@ui-kitten/components'
import {TabView,TabBar} from 'react-native-tab-view'
import i18n from 'i18n-js'
import Modal from 'react-native-modal'

import TopAction from '@pn/components/navigation/TopAction'
import Layout from '@pn/components/global/Layout';
import Button from '@pn/components/global/Button'
import Pressable from '@pn/components/global/Pressable'
import Header,{useHeader,headerHeight as headerHeightt} from '@pn/components/navigation/Header'
import usePagination from '@pn/utils/usePagination'
import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import {specialHTML} from '@pn/utils/Main'
import Skeleton from '@pn/components/global/Skeleton'
import useAPI from '@pn/utils/API'
import Recaptcha from '@pn/components/global/Recaptcha'
import {useLinkTo} from '@react-navigation/native'

const {width} = Dimensions.get('window')
const InputIcon = (props)=><Icon {...props} name="plus-circle-outline" />

const RenderInput=React.memo(({onClose})=>{
	const [input,setInput]=React.useState("")
    const [loading,setLoading]=React.useState(false);
    const [result,setResult]=React.useState(null)
	const [recaptcha,setRecaptcha]=React.useState("");
	const theme = useTheme();
	const {PNpost} = useAPI();
	const captcha = React.useRef(null)
	const linkTo = useLinkTo();

	const onReceiveToken=React.useCallback((token)=>{
        setRecaptcha(token)
    },[])

	const handleSubmit=()=>{
		if(input.trim().match(/twitter\.com/)) {
			setLoading(true)
			PNpost(`/twitter/thread`,{url:input,recaptcha:recaptcha},undefined,false)
			.then((res)=>{
				if(res?.error) ToastAndroid.show(res?.msg,ToastAndroid.LONG)
				else {
					setInput("");
					setResult(res?.data);
				}
			})
			.catch((err)=>{
				if(err?.response?.data) {
					ToastAndroid.show(typeof err?.response?.data?.msg === 'string' ? err?.response?.data?.msg : i18n.t('errors.general'),ToastAndroid.LONG);
				}
				else if(err?.response?.status===503) {
					ToastAndroid.show(i18n.t('errors.server'),ToastAndroid.LONG);
				} else {
					ToastAndroid.show(i18n.t('errors.general'),ToastAndroid.LONG)
				}
			})
			.finally(()=>{
				setLoading(false)
				captcha?.current?.refreshToken()
			})
		} else {
			ToastAndroid.show(i18n.t("errors.invalid",{type:i18n.t('url')}),ToastAndroid.LONG)
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
				onSubmitEditing={handleSubmit}
			/>
			<View style={{marginTop:10}}>
				<Button disabled={loading} loading={loading} onPress={handleSubmit}>Submit</Button>
			</View>
			{result !== null && (
				<View>
					<Divider style={{marginVertical:15,backgroundColor:theme['border-text-color']}} />
					<Card onPress={handleTo}>
						<Text category="p1">{specialHTML(result?.tweet)}</Text>
					</Card>
				</View>
			)}
			<Recaptcha ref={captcha} onReceiveToken={onReceiveToken} />
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
		mutate,isValidating,isLoadingInitialData
	} = usePagination("/twitter?type=recent","data",20,false,false)

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
	const headerHeight={...headerHeightt,sub:46}
	const heightHeader = headerHeight?.main + headerHeight?.sub
	const [open,setOpen]=React.useState(false);

	const renderTabBar=(props)=>{
		
		return (
			<Animated.View style={{zIndex: 1,position:'absolute',backgroundColor: theme['background-basic-color-1'],left: 0,top:0,width: '100%',transform: [{translateY}]}}>
				<Header title="Twitter Thread Reader" navigation={navigation} height={56} withBack menu={()=><TopAction icon={InputIcon} tooltip={i18n.t("new_type",{type:i18n.t('twitter_thread')})} onPress={()=>setOpen(true)} />} >
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
			<Modal
                isVisible={open}
                style={{margin:0,justifyContent:'center',alignItems:'center'}}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
				<RenderInput onClose={()=>setOpen(false)} />
			</Modal>
		</Layout>
	);
}