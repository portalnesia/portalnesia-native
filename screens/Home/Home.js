import React from 'react';
import {ScrollView,View,TouchableOpacity } from 'react-native';
import {Layout as Lay, Text,Card,Spinner,useTheme} from '@ui-kitten/components'
import Carousel from '@pn/components/global/Carousel';
import useAPI from '@pn/utils/API'
import {CONTENT_URL,API_URL} from '@env'
//import * as firebase from 'firebase';

import Button from '@pn/components/global/Button'
import Image from '@pn/components/global/Image'
import style from '@pn/components/global/style'
import Layout from '@pn/components/global/Layout';
import {specialHTML} from '@pn/utils/Main'
//import Text from '../components/utils/UbuntuFont';
//mport { AuthContext } from '@pn/provider/AuthProvider';

//const CONTENT_URL='https://content.portalnesia.com',API_URL='https://api.portalnesia.com'

const RenderNews = React.memo(({item:dt, index:i}) => {
	return (
		<Card key={i} onPress={()=>navigation.navigate("NewsDetail",{source:dt?.source,title:encodeURIComponent(dt.title)})}>
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

const RenderChord = React.memo(({item:dt, index:i}) => {
	return (
		<Card style={{borderWidth:2}} key={i} onPress={()=>navigation.navigate("ChordDetail",{slug:dt?.slug})}>
			<Text category="p1" style={{fontWeight:"700"}}>{`${dt.title} - ${dt.artist}`}</Text>
			<Text category="label" style={{marginTop:5}}>{dt.original}</Text>
		</Card>
	);
})

const RenderTwibbon = React.memo(({item:dt, index:i}) => {
	return (
		<Card key={i}>
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

const RenderThread = React.memo(({item:dt, index:i}) => {
	return (
		<Card style={{borderWidth:2}} key={i} onPress={()=>navigation.navigate("TwitterThread",{slug:dt?.tweet_id})}>
			<Text category="p1" style={{fontWeight:"700"}}>{`Thread by @${dt.screen_name}`}</Text>
			<Text category="label" style={{marginTop:5}}>{specialHTML(dt.tweet)}</Text>
		</Card>
	);
})

const About=React.memo(({title,txt,right,last,screen,navigation})=>{
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

export default function HomeScreen({ navigation }) {
	const [loading,setLoading] = React.useState(true)
	const [data,setData]=React.useState({})
	const [error,setError] = React.useState(false)
	const {PNget} = useAPI();
	
	React.useEffect(()=>{
		PNget('/home')
		.then(res=>{
			setError(Boolean(res?.error))
			if(!res?.error) {
				setData(res);
			}
		})
		.catch(()=>setError(true))
		.finally(()=>setLoading(false));
	},[])
	
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
						<About title="News" txt="A collection of news that is updated every day." screen="News" navigation={navigation} />
						<About title="Chord" txt="A collection of guitar chords with transpose tools, auto scroll, font sizer, and print features that make it easy to learn guitar." right screen="Chord" navigation={navigation} />
						<About title="URL Shortener" txt="Shorten your long URLs so that it's easy to share with others." navigation={navigation} />
						<About title="Twitter Thread Reader" txt="Read threads from Twitter easily." right  screen="Twitter" navigation={navigation} />
						{/*<About title="Twibbon" txt="Create your own twibbon or edit your photo to twibbon that is already available and share it easily." /> */}
						<About title="Transform Coordinate" txt="Insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection." right screen="GeodataTransform" navigation={navigation} />
						{/*<About title="Twitter Menfess" txt={`Send a message or just the words you want to convey to "someone" as anonymous without notifying the sender's identity.`} />
						<About title="Quiz" txt="Create your own quiz and share with friends or answer a few quizzes." right />*/}
						<About title="Parse HTML" txt="Parse your HTML code into XML code compatible with all the Blogger templates or other blogs systems." screen="ParseHtml" navigation={navigation} />
						<About title="Blog" txt="Turn your thoughts into writing and share it easily." right screen="Blog" navigation={navigation} />
						<About title="Images Checker" txt="Online tools to help you quickly identify unseemly images." screen="ImagesChecker" navigation={navigation} />
						<About title="Others" txt="And some other services that are definitely useful." right screen="Menu" navigation={navigation} />
					</Lay>
				</Lay>
				<Lay style={{marginTop:30,alignItems:'center'}} level="2">
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>Recent News</Text>
					{loading ? (
						<Spinner size='giant' />
					) : error ? (
						<Text>Something went wrong</Text>
					) : (
						<Carousel
							data={data?.news}
							renderItem={(props)=><RenderNews {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} onPress={()=>navigation.navigate("News")}>See More</Button>
				</Lay>
				<Lay style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>Recent Chord</Text>
					{loading ? (
						<Spinner size='giant' />
					) : error ? (
						<Text>Something went wrong</Text>
					) : (
						<Carousel
							data={data?.chord}
							renderItem={(props)=><RenderChord {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>navigation.navigate("Chord")}>See More</Button>
				</Lay>
				{/*
					<Lay style={{marginTop:30,alignItems:'center'}} level="2">
						<Text category="h2" style={{textAlign:'center',marginBottom:30}}>Recent Twibbon</Text>
						{!data && !error ? (
							<Spinner size='giant' />
						) : error || data?.error == 1 ? (
							<Text>Something went wrong</Text>
						) : (
							<Carousel
								data={data?.twibbon}
								renderItem={_renderTwibbon}
							/>
						)}
						<Button style={{marginTop:10,marginBottom:40}} size="small">See More</Button>
					</Lay>
				*/}
				<Lay level="2" style={{paddingTop:30,alignItems:'center'}}>
					<Text category="h2" style={{textAlign:'center',marginBottom:30}}>Recent Twitter Thread</Text>
					{loading ? (
						<Spinner size='giant' />
					) : error ? (
						<Text>Something went wrong</Text>
					) : (
						<Carousel
							data={data?.thread}
							renderItem={(props)=><RenderThread {...props} navigation={navigation} />}
						/>
					)}
					<Button style={{marginTop:10,marginBottom:40}} size="small" onPress={()=>navigation.navigate("Main",{screen:"Twitter"})}>See More</Button>
				</Lay>
			</ScrollView>
		</Layout>
	);
}

/*
<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{ This text using ubuntu font/}
				<Text bold>Hello World</Text>
				<Text>This text using ubuntu font</Text>
				<TouchableOpacity
					onPress={() => {
						navigation.navigate('SecondScreen');
					}}
					style={{
						backgroundColor: Colors.primary,
						padding: 10,
						paddingHorizontal: 20,
						marginTop: 10,
						borderRadius: 10,
					}}
				>
					<Text style={{ color: 'white' }} bold>
						Go to second screen
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						setNotif('error',"Under Maintenance","This feature is under maintenance")
						//firebase.auth().signOut();
					}}
					style={{
						backgroundColor: '#FF3A3A',
						padding: 10,
						paddingHorizontal: 20,
						marginTop: 10,
						borderRadius: 10,
					}}
				>
					<Text style={{ color: 'white' }} bold>
						Logout
					</Text>
				</TouchableOpacity>
			</View>
*/