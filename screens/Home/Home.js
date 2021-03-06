import React from 'react';
import {ScrollView,View,Dimensions,FlatList,RefreshControl,AppState } from 'react-native';
import {Layout as Lay, Text,Card,useTheme,Icon, Divider} from '@ui-kitten/components'
import Carousel from '@pn/components/global/Carousel';
import useAPI from '@pn/utils/API'
import {CONTENT_URL} from '@env'
import i18n from 'i18n-js'
import {useScrollToTop} from '@react-navigation/native'
import FastImage from '@pn/module/FastImage'

import {FeedbackToggle} from '@pn/components/global/MoreMenu'
import {linkTo} from '@pn/navigation/useRootNavigation'
import Button from '@pn/components/global/Button'
import Image from '@pn/components/global/Image'
import style from '@pn/components/global/style'
import Layout from '@pn/components/global/Layout';
import {specialHTML} from '@portalnesia/utils'
import Skltn from 'react-native-skeleton-placeholder'
import CountUp from '@pn/components/global/Countup'
import Skeleton from '@pn/components/global/Skeleton';
import { getLocation, reverseGeocode } from '@pn/utils/Location';
import { LocationAccuracy } from 'expo-location';
import useSWR from '@pn/utils/swr';
import { log, logError } from '@pn/utils/log';
import Spinner from '@pn/components/global/Spinner'
import useSelector from '@pn/provider/actions'

const {width} = Dimensions.get('window')

const RenderNews = React.memo(({item:dt, index:i}) => {
	const image = React.useMemo(()=>{
		if(dt?.image) return dt?.image;
		else return `${CONTENT_URL}/img/url?size=500&export=twibbon&watermark=no&image=${encodeURIComponent(dt.foto)}`
	},[dt])
	return (
		<Card key={i} onPress={()=>linkTo(`/${dt?.link}`)}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 150,
						width: 150,
					}}
					source={{uri:image}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"700"}}>{dt.title}</Text>
			{dt?.text && <Text category="label" style={{marginTop:5}}>{specialHTML(dt.text)}</Text> }
		</Card>
	);
})
const renderNews = (props)=><RenderNews {...props} />

const RenderChord = React.memo(({item:dt, index:i}) => {
	const onPress=()=>{
		const link = dt?.slug ? `/chord/${dt?.slug}` : dt?.link;
		linkTo(link)
	}
	const title = React.useMemo(()=>{
		if(dt?.artist) return `${dt.title} - ${dt.artist}`
		else return dt?.title;
	},[dt])
	const text = React.useMemo(()=>{
		if(dt?.original) return dt?.original
		else return dt?.text
	},[dt])
	return (
		<Card style={{borderWidth:dt?.original ? 2 : 1}} key={i} onPress={onPress}>
			<Text category="p1" style={{fontWeight:"700"}}>{title}</Text>
			<Text category="label" style={{marginTop:5}}>{text}</Text>
		</Card>
	);
})
const renderChord = (props)=><RenderChord {...props} />

const RenderTwibbon = React.memo(({item:dt, index:i}) => {
	
	return (
		<Card key={i} onPress={()=>linkTo(`/twibbon/${dt?.slug}`)}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 150,
						width: 150,
					}}
					source={{uri:`${CONTENT_URL}/img/twibbon/${encodeURIComponent(dt.slug)}`}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"700"}}>{dt.judul}</Text>
			{dt?.deskripsi?.length > 0 &&  <Text category="label" style={{marginTop:5}}>{dt.deskripsi}</Text> }
		</Card>
	);
})
const renderTwibbon = (props)=><RenderTwibbon {...props} />

const RenderThread = React.memo(({item:dt, index:i}) => {
	const title=React.useMemo(()=>{
		if(dt?.screen_name) return `Thread by @${dt.screen_name}`
		else return dt?.title;
	},[dt])
	const text = React.useMemo(()=>{
		if(dt?.tweet) return specialHTML(dt.tweet)
		else return specialHTML(dt?.text)
	},[dt])
	const onPress=()=>{
		const link = dt?.tweet_id ? `/twitter/thread/${dt?.tweet_id}` : dt?.link;
		linkTo(link)
	}
	return (
		<Card style={{borderWidth:dt?.screen_name ? 2 : 1}} key={i} onPress={onPress}>
			<Text category="p1" style={{fontWeight:"700"}}>{title}</Text>
			<Text category="label" style={{marginTop:5}}>{text}</Text>
		</Card>
	);
})
const renderThread = (props)=><RenderThread {...props} />

const About=React.memo(({title,txt,right,last,screen})=>{
	useSelector(state=>state.lang)
	
	if(last) {
		return (
			<Lay style={{marginTop:5,marginBottom:5,padding:10,...(last ? {marginBottom:50} : {}) }}>
				<Text category="h6" {...(right ? {style:{textAlign:'right'}} : {})}>{title}</Text>
				<Text category="s2" {...(right ? {style:{textAlign:'right'}} : {})}>{txt}</Text>
			</Lay>
		)
	}
	return (
		<Card appearance="filled" onPress={()=>screen && linkTo(screen)} style={{marginTop:5,marginBottom:5,padding:10,...(last ? {marginBottom:50} : {}) }}>
			<Text category="h6" {...(right ? {style:{textAlign:'right'}} : {})}>{title}</Text>
			<Text category="s2" {...(right ? {style:{textAlign:'right'}} : {})}>{txt}</Text>
		</Card>
	)
})

const loginArray=()=>([
	{
		key:'weather',
		title:"Weather",
		data:null
	},
	{
		key:"chord",
		title:i18n.t('chord'),
		data:null,
		icon:["library-music","material"],
		to:'/chord'
	},
	{
		key:"session",
		title:"Session",
		data:null,
		to:'/setting/security',
		icon:["security","material"]
	},
	{
		key:"twibbon",
		title:"Twibbon",
		data:null,
		icon:['ios-image','ionicons'],
		to:'/twibbon'
	},
	{
		key:"url",
		title:"URL",
		data:null,
		icon:['link','font_awesome'],
		to:'/url'
	},
	{
		key:"blog",
		title:"Blog",
		data:null,
		icon:['article','material'],
		to:'/blog'
	}
])

const RenderInformation=React.memo(({data,item,index})=>{
	const angka = React.useMemo(()=>(index % 2),[index]);
	const cardSize=React.useMemo(()=>((width/2)-7),[])
	const next = React.useMemo(()=>(data?.[index+1]?.key ? data?.[index+1] : false),[data]);
	const theme = useTheme();

	const onPress=React.useCallback((it)=>()=>{
		if(it?.to) {
			linkTo(it?.to)
		}
	},[])
	
	if(angka===0) {
		return (
			<View key={`view-${index}`} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
				<Card key={0} style={{width:cardSize,margin:5,marginRight:2}} {...(item?.to ? {onPress:onPress(item)} : {disabled:true})} >
					{item?.data === null ? (
						<Skltn backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']} height={item?.icon ? 65 : 115}>
							<Skltn.Item width={cardSize-30} >
								<Skltn.Item>
									<Skltn.Item height={30} width={40} marginRight={15} marginBottom={5} borderRadius={4} />
									<Skltn.Item height={20} width={(cardSize-60)} marginBottom={8} borderRadius={4} />
									<Skltn.Item height={item?.icon ? 0 : 50} width={item?.icon ? 0 : 50} borderRadius={4} />
								</Skltn.Item>
							</Skltn.Item>
						</Skltn>
					) : item?.data === false ? (
						<View style={{marginBottom:10}}>
							<Text>Error</Text>
							<Text>Something went wrong.</Text>
						</View>
					) : item?.key==='weather' ? (
						<View style={{marginBottom:10}}>
							<Text category="h2" style={{fontFamily:"Inter_Medium"}}>{item?.data?.temperature}</Text>
							<Text>{item?.data?.text}</Text>
							<Text>{item?.data?.title}</Text>
							{item?.data?.icon && <FastImage style={{width:50,height:50}} source={{uri:item?.data?.icon}} /> }
						</View>
					) : (
						<View style={{marginBottom:10}}>
							<Text category="h2" style={{fontFamily:"Inter_Medium"}}><CountUp data={{number:item?.data,format:`${item?.data}`}} /></Text>
							<Text>{item?.title}</Text>
						</View>
					)}
					{item?.icon && (
						<Icon name={item?.icon[0]} pack={item?.icon[1]} style={{tintColor:theme['color-indicator-bar'],height:50}} />
					)}
				</Card>
				{next ? (
					<Card key={1} style={{width:cardSize,margin:5,marginLeft:2}} {...(next?.to ? {onPress:onPress(next)} : {disabled:true})}>
						{next?.data === null ? (
							<Skltn backgroundColor={theme['skeleton-background-color']} highlightColor={theme['skeleton-hightlight-color']} height={next?.icon ? 65 : 115}>
								<Skltn.Item width={cardSize-30} >
									<Skltn.Item>
										<Skltn.Item height={30} width={40} marginRight={15} marginBottom={5} borderRadius={4} />
										<Skltn.Item height={20} width={(cardSize-60)} marginBottom={8} borderRadius={4} />
										<Skltn.Item height={next?.icon ? 0 : 50} width={next?.icon ? 0 : 50} borderRadius={4} />
									</Skltn.Item>
								</Skltn.Item>
							</Skltn>
						) : item?.data === false ? (
							<View style={{marginBottom:10}}>
								<Text>Error</Text>
								<Text>Something went wrong.</Text>
							</View>
						) : (
							<View style={{marginBottom:10}}>
								<Text category="h2" style={{fontFamily:"Inter_Medium"}}><CountUp data={{number:next?.data,format:`${next?.data}`}} /></Text>
								<Text>{next?.title}</Text>
							</View>
						)}
						{next?.icon && (
							<Icon name={next?.icon[0]} pack={next?.icon[1]} style={{tintColor:theme['color-indicator-bar'],height:50}} />
						)}
					</Card>
				) : null}
			</View>
		)
	}
	return null;
})

const Dashboard=React.memo(({loading,data,error,navigation,onMutate})=>{
	useSelector(state=>state.lang)
	const ref=React.useRef(null)
	const theme=useTheme();
	const {PNpost} = useAPI();
	const [cuaca,setCuaca]=React.useState(null);
	//const [sudahCuaca,setSudahCuaca]=React.useState(false)

	useScrollToTop(ref)
	const dt = React.useMemo(()=>{
		const array = loginArray();
		const obj = Object.keys(array).map((k)=>{
			const i = Number(k)
			const item = array[i]
			if(item.key === 'weather') item.data=cuaca;
			else if(loading || typeof data?.data?.count?.[item.key] === 'undefined') item.data=null;
			else if(error) item.data=false;
			else if(typeof data?.data?.count?.[item.key] !== 'undefined') {
				item.data = Number(data?.data?.count?.[item.key]);
			}
			return item;
		})
		return obj;
	},[data,loading,error,cuaca])

	const renderFooter=React.useCallback(()=>(
		<React.Fragment>
			<View style={{paddingVertical:30,marginBottom:15}}>
				<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15}}>
					<Text category="h5">{i18n.t('recent_type',{type:i18n.t('news')})}</Text>
					<Button size="small" text onPress={()=>linkTo("/news")}>{i18n.t('see_more')}</Button>
				</View>
				
				<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
				{loading || (data && data?.data?.news?.length === 0) ? <View style={{paddingHorizontal:15,paddingVertical:10}}><Skeleton card type='caraousel' image height={300} /></View>
				: error ? (
					<Text style={{paddingHorizontal:15}}>Failed to load data</Text>
				) : data?.data?.news?.length > 0 ? (
					<Carousel
						data={data?.data?.news}
						renderItem={renderNews}
						autoplay
					/>
				) : (
					<Text style={{paddingHorizontal:15}}>No posts</Text>
				)}
			</View>
			<View style={{paddingBottom:30,marginBottom:15}}>
				<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15}}>
					<Text category="h5">{i18n.t('recent_type',{type:i18n.t('chord')})}</Text>
					<Button size="small" text onPress={()=>linkTo("/chord")}>{i18n.t('see_more')}</Button>
				</View>
				
				<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
				{loading || (data && data?.data?.chord?.length === 0) ? <View style={{paddingHorizontal:15,paddingVertical:10}}><Skeleton card type='caraousel' height={100} /></View>
				: error ? (
					<Text style={{paddingHorizontal:15}}>Failed to load data</Text>
				) : data?.data?.chord?.length > 0 ? (
					<Carousel
						data={data?.data?.chord}
						renderItem={renderChord}
						autoplay
					/>
				) : (
					<Text style={{paddingHorizontal:15}}>No posts</Text>
				)}
			</View>
			<View style={{paddingBottom:30,marginBottom:15}}>
				<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:15}}>
					<Text category="h5">{i18n.t('recent_type',{type:i18n.t('twitter_thread')})}</Text>
					<Button size="small" text onPress={()=>linkTo("/twitter/thread")}>{i18n.t('see_more')}</Button>
				</View>
				
				<Divider style={{marginVertical:10,backgroundColor:theme['border-text-color']}} />
				{loading || (data && data?.data?.thread?.length === 0 ) ? <View style={{paddingHorizontal:15,paddingVertical:10}}><Skeleton card type='caraousel' height={100} /></View>
				: error ? (
					<Text style={{paddingHorizontal:15}}>Failed to load data</Text>
				) : data?.data?.thread?.length > 0 ? (
					<Carousel
						data={data?.data?.thread}
						renderItem={renderThread}
						autoplay
					/>
				) : (
					<Text style={{paddingHorizontal:15}}>No posts</Text>
				)}
			</View>
		</React.Fragment>
	),[data,loading])

	const toggle = React.useCallback(()=>(
		<FeedbackToggle />
	),[])

	const getCuaca=React.useCallback(()=>{
		if(AppState.currentState==='active') {
			getLocation({accuracy:LocationAccuracy.Lowest})
			.then(({coords:{latitude,longitude}})=>{
				return reverseGeocode({latitude,longitude})
			})
			.then((geocode)=>{
				return PNpost('/weather',geocode[0]);
			})
			.then(res=>{
				setCuaca(res);
			})
			.catch(e=>{
				logError(e,"getCuaca Home.js");
				log("getCuaca Home.js error");
				setCuaca({error:1,title:"Errors",text:"Under maintenance",icon:null,temperature:0})
			})
		}
	},[])

	const onRefresh=()=>{
		if(!loading && onMutate) {
			onMutate();
			getCuaca()
		}
	}

	React.useEffect(()=>{
		let tim=null;
		if(cuaca===null) {
			tim = setTimeout(()=>{
				getCuaca();
			},700)
		}
		return ()=>{
			if(tim!=null) clearTimeout(tim);
		}
	},[])

	const renderItem=React.useCallback((props)=><RenderInformation data={dt} {...props} />,[dt])

	return (
		<Layout navigation={navigation} title="Portalnesia" align="start" withBack={false} menu={toggle} forceEnable>
			<FlatList
				columnWrapperStyle={{flexWrap:'wrap',flex:1}}
				data={dt}
				renderItem={renderItem}
				numColumns={2}
				ref={ref}
				ListFooterComponent={renderFooter}
				refreshControl={
					<RefreshControl
						colors={['white']}
						progressBackgroundColor="#2f6f4e"
						onRefresh={onRefresh}
						refreshing={Boolean(loading&&data)}
					/>
				}
			/>
        </Layout>
	)
})

const NotLogin=React.memo(({loading,data,error,navigation})=>{
	useSelector(state=>state.lang)
	const ref=React.useRef(null)
	useScrollToTop(ref)
	return (
		<Layout navigation={navigation}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
				}}
				ref={ref}
			>
				<Lay style={style.container}>
					<View>
						<Image
							fullSize
							source={require('@pn/assets/landing.png')}
						/>
					</View>
					
					<Text category="h1" style={{textAlign:'center'}}>The Future Platform</Text>
					<Text category="p1">A multi-functional website to accompany you to surf the internet. Sign up to get more features.</Text>
					<Lay style={{marginTop:20}}>
						<About title="News" txt={i18n.t('home_not_login.news')} screen="/news" navigation={navigation} />
						<About title="Chord" txt={i18n.t('home_not_login.chord')} right screen="/chord" navigation={navigation} />
						<About title="URL Shortener" txt={i18n.t('home_not_login.url')} screen="/url" navigation={navigation} />
						<About title="Twitter Thread Reader" txt={i18n.t('home_not_login.twitter')} right  screen="/twitter/thread" navigation={navigation} />
						<About title="Twibbon" txt={i18n.t('home_not_login.twibbon')}  screen="/twibbon" navigation={navigation} />
						<About title="Transform Coordinate" txt={i18n.t('home_not_login.transform')} right screen="/geodata/transform" navigation={navigation} />
						{/*<About title="Twitter Menfess" txt={`Send a message or just the words you want to convey to "someone" as anonymous without notifying the sender's identity.`} />
						<About title="Quiz" txt="Create your own quiz and share with friends or answer a few quizzes." right />*/}
						<About title="Parse HTML" txt={i18n.t('home_not_login.html')} screen="/parse-html" navigation={navigation} />
						<About title="Blog" txt={i18n.t('home_not_login.blog')} right screen="/blog" navigation={navigation} />
						<About title="Images Checker" txt={i18n.t('home_not_login.images_checker')} screen="/images-checker" navigation={navigation} />
						<About title="Others" txt={i18n.t('home_not_login.others')} right screen="/login-callback" navigation={navigation} />
					</Lay>
				</Lay>
				<Lay style={{marginTop:30,alignItems:'center'}} level="2">
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('news')})}</Text>
					{(loading || !data?.news) && !error ? (
						<View style={{marginBottom:15}}>
							<Spinner size='large' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.news}
							renderItem={renderNews}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} onPress={()=>linkTo("/news")}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('chord')})}</Text>
					{(loading || (data && !data?.chord)) ? (
						<View style={{marginBottom:15}}>
							<Spinner size='large' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.chord}
							renderItem={renderChord}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>linkTo("/chord")}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{marginTop:30,alignItems:'center'}} level="2">
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:"Twibbon"})}</Text>
					{(!data?.twibbon || loading) ? (
						<View style={{marginBottom:15}}>
							<Spinner size='large' />
						</View>
					) : error || data?.error == 1 ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.twibbon}
							renderItem={renderTwibbon}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>linkTo("/twibbon")}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('twitter_thread')})}</Text>
					{(loading || !data?.thread) ? (
						<View style={{marginBottom:15}}>
							<Spinner size='large' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.thread}
							renderItem={renderThread}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>linkTo("/twitter/thread")}>{i18n.t('see_more')}</Button>
				</Lay>
			</ScrollView>
		</Layout>
	)
})

export default function HomeScreen({ navigation }) {
	const isLogin = useSelector(state=>state.isLogin)
	const {data,error,isValidating,mutate} = useSWR("/home");
	
	const loading=React.useMemo(()=>{
		return ((!data&&!error)||isValidating)
	},[data,error,isValidating])

	const onMutate=React.useCallback(()=>{
		if(!isValidating) mutate();
	},[isValidating,mutate])

	React.useEffect(()=>{
		mutate();
	},[isLogin])

	if(isLogin) return <Dashboard onMutate={onMutate} loading={loading} data={data} error={error} navigation={navigation} />
	else return <NotLogin loading={loading} data={data} error={error} navigation={navigation} />
}