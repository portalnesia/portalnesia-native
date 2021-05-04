import React from 'react';
import {ScrollView,View,TouchableOpacity } from 'react-native';
import {Layout as Lay, Text,Card,Spinner,useTheme} from '@ui-kitten/components'
import Carousel from '@pn/components/global/Carousel';
import useAPI from '@pn/utils/API'
import {CONTENT_URL,API_URL} from '@env'
import i18n from 'i18n-js'
import {useLinkTo} from '@react-navigation/native'

import { AuthContext } from '@pn/provider/Context';
import Button from '@pn/components/global/Button'
import Image from '@pn/components/global/Image'
import style from '@pn/components/global/style'
import Layout from '@pn/components/global/Layout';
import {specialHTML} from '@pn/utils/Main'
//import Text from '../components/utils/UbuntuFont';

//const CONTENT_URL='https://content.portalnesia.com',API_URL='https://api.portalnesia.com'

const RenderNews = React.memo(({item:dt, index:i}) => {
	const linkTo = useLinkTo();
	return (
		<Card key={i} onPress={()=>linkTo(`/news/${dt?.source}/${encodeURIComponent(dt.title)}`)}>
			<View style={{alignItems:'center'}}>
				<Image
					resizeMode="center"
					style={{
						height: 150,
						width: 150,
					}}
					source={{uri:`${CONTENT_URL}/img/url?size=500&export=twibbon&watermark=no&image=${encodeURIComponent(dt.foto)}`}}
				/>
			</View>
			<Text category="p1" style={{marginTop:10,fontWeight:"700"}}>{dt.title}</Text>
			<Text category="label" style={{marginTop:5}}>{specialHTML(dt.text)}</Text>
		</Card>
	);
})

const RenderChord = React.memo(({item:dt, index:i,navigation}) => {
	return (
		<Card style={{borderWidth:2}} key={i} onPress={()=>navigation.navigate("ChordDetail",{slug:dt?.slug})}>
			<Text category="p1" style={{fontWeight:"700"}}>{`${dt.title} - ${dt.artist}`}</Text>
			<Text category="label" style={{marginTop:5}}>{dt.original}</Text>
		</Card>
	);
})

const RenderTwibbon = React.memo(({item:dt, index:i,navigation}) => {
	return (
		<Card key={i} onPress={()=>navigation.navigate("TwibbonDetail",{slug:dt?.slug})}>
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

const RenderThread = React.memo(({item:dt, index:i,navigation}) => {
	return (
		<Card style={{borderWidth:2}} key={i} onPress={()=>navigation.navigate("TwitterThread",{slug:dt?.tweet_id})}>
			<Text category="p1" style={{fontWeight:"700"}}>{`Thread by @${dt.screen_name}`}</Text>
			<Text category="label" style={{marginTop:5}}>{specialHTML(dt.tweet)}</Text>
		</Card>
	);
})

const About=React.memo(({title,txt,right,last,screen,navigation})=>{
	const context = React.useContext(AuthContext)
	if(last) {
		return (
			<Lay style={{marginTop:5,marginBottom:5,padding:10,...(last ? {marginBottom:50} : {}) }}>
				<Text category="h6" {...(right ? {style:{textAlign:'right'}} : {})}>{title}</Text>
				<Text category="s2" {...(right ? {style:{textAlign:'right'}} : {})}>{txt}</Text>
			</Lay>
		)
	}
	return (
		<Card appearance="filled" onPress={()=>screen && navigation.navigate(screen)} style={{marginTop:5,marginBottom:5,padding:10,...(last ? {marginBottom:50} : {}) }}>
			<Text category="h6" {...(right ? {style:{textAlign:'right'}} : {})}>{title}</Text>
			<Text category="s2" {...(right ? {style:{textAlign:'right'}} : {})}>{txt}</Text>
		</Card>
	)
})

const Dashboard=({loading,data,error,navigation})=>{
	const context = React.useContext(AuthContext)
	return (
		<Layout navigation={navigation}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
				}}
			>
                <Text>Login Dashboard</Text>
            </ScrollView>
        </Layout>
	)
}

const NotLogin=React.memo(({loading,data,error,navigation})=>{
	const context = React.useContext(AuthContext)
	return (
		<Layout navigation={navigation}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
				}}
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
						<About title="News" txt={i18n.t('home_not_login.news')} screen="News" navigation={navigation} />
						<About title="Chord" txt={i18n.t('home_not_login.chord')} right screen="Chord" navigation={navigation} />
						<About title="URL Shortener" txt={i18n.t('home_not_login.url')} screen="UrlShortener" navigation={navigation} />
						<About title="Twitter Thread Reader" txt={i18n.t('home_not_login.twitter')} right  screen="Twitter" navigation={navigation} />
						<About title="Twibbon" txt={i18n.t('home_not_login.twibbon')}  screen="Twibbon" navigation={navigation} />
						<About title="Transform Coordinate" txt={i18n.t('home_not_login.transform')} right screen="GeodataTransform" navigation={navigation} />
						{/*<About title="Twitter Menfess" txt={`Send a message or just the words you want to convey to "someone" as anonymous without notifying the sender's identity.`} />
						<About title="Quiz" txt="Create your own quiz and share with friends or answer a few quizzes." right />*/}
						<About title="Parse HTML" txt={i18n.t('home_not_login.html')} screen="ParseHtml" navigation={navigation} />
						<About title="Blog" txt={i18n.t('home_not_login.blog')} right screen="Blog" navigation={navigation} />
						<About title="Images Checker" txt={i18n.t('home_not_login.images_checker')} screen="ImagesChecker" navigation={navigation} />
						<About title="Others" txt={i18n.t('home_not_login.others')} right screen="Menu" navigation={navigation} />
					</Lay>
				</Lay>
				<Lay style={{marginTop:30,alignItems:'center'}} level="2">
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('news')})}</Text>
					{loading ? (
						<View style={{marginBottom:15}}>
							<Spinner size='giant' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.news}
							renderItem={(props)=><RenderNews {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} onPress={()=>navigation.navigate("News")}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('chord')})}</Text>
					{loading ? (
						<View style={{marginBottom:15}}>
							<Spinner size='giant' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.chord}
							renderItem={(props)=><RenderChord {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>navigation.navigate("Chord")}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{marginTop:30,alignItems:'center'}} level="2">
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:"Twibbon"})}</Text>
					{!data && !error ? (
						<View style={{marginBottom:15}}>
							<Spinner size='giant' />
						</View>
					) : error || data?.error == 1 ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.twibbon}
							renderItem={(props)=><RenderTwibbon {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>navigation.navigate("Main",{screen:"Twibbon"})}>{i18n.t('see_more')}</Button>
				</Lay>
				<Lay style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>{i18n.t('recent_type',{type:i18n.t('twitter_thread')})}</Text>
					{loading || !data ? (
						<View style={{marginBottom:15}}>
							<Spinner size='giant' />
						</View>
					) : error ? (
						<Text>{i18n.t('errors.general')}</Text>
					) : (
						<Carousel
							data={data?.thread}
							renderItem={(props)=><RenderThread {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>navigation.navigate("Main",{screen:"Twitter"})}>{i18n.t('see_more')}</Button>
				</Lay>
			</ScrollView>
		</Layout>
	)
})

export default function HomeScreen({ navigation }) {
	const context = React.useContext(AuthContext);
	const {user} = context.state
	const [loading,setLoading] = React.useState(true)
	const [data,setData]=React.useState()
	const [error,setError] = React.useState(false)
	const {PNget} = useAPI();
	//const state = useNavigationState(state=>({index:state.index,routes:state.routes}));
	
	React.useEffect(()=>{
		setTimeout(()=>{
			PNget('/home')
			.then(res=>{
				setError(Boolean(res?.error))
				if(!res?.error) {
					setData(res);
				}
			})
			.catch(()=>setError(true))
			.finally(()=>setLoading(false));
		},200)

		return ()=>{
			setLoading(true);
			setError(false)
		}
	},[user])

	if(user !== false) return <Dashboard loading={loading} data={data} error={error} navigation={navigation} />
	else return <NotLogin loading={loading} data={data} error={error} navigation={navigation} />
}