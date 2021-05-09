import {createURL,getInitialURL as expoGetInitialURL,addEventListener as ExpoAddListener,removeEventListener as ExpoRemoveListener} from 'expo-linking'
import {addNotificationResponseReceivedListener} from 'expo-notifications'
import {openBrowserAsync} from 'expo-web-browser'

export const linking = {
    prefixes:[createURL('/'),'https://portalnesia.com'],
    config:{
        screens:{
            MainTabs:{
                screens:{
                    Home:{
                        path:''
                    },
                    News:{
                        path:'news',
                        exact:true
                    },
                    Chord:{
                        path:'chord',
                        exact:true
                    },
                    Search:{
                        path:'search',
                        exact:true
                    },
                    Menu:{
                        path:'login-callback',
                        exact:true
                    },
                }
            },
            Setting:{
                path:'setting',
                exact:true,
            },
            NewsDetail:{
                path:'news/:source/:title',
                exact:true
            },
            ChordList:{
                path:'chord/artist/:slug?',
                exact:true
            },
            ChordDetail:{
                path:'chord/:slug',
                exact:true
            },
            Blog:{
                path:'blog',
                exact:true
            },
            BlogDetail:{
                path:'blog/:slug',
                exact:true
            },
            BlogList:{
                path:'blog/:blogType/:slug',
                exact:true
            },
            Pages:{
                path:'pages/:slug',
                exact:true
            },
            Twitter:{
                path:'twitter/thread',
                exact:true
            },
            TwitterThread:{
                path:'twitter/thread/:slug',
                exact:true
            },
            GeodataTransform:{
                path:'geodata/transform',
                exact:true
            },
            NumberGenerator:{
                path:'random-number',
                exact:true
            },
            ParseHtml:{
                path:'parse-html',
                exact:true
            },
            ImagesChecker:{
                path:'images-checker',
                exact:true
            },
            QrGenerator:{
                path:'qr-code/:slug?',
                exact:true
            },
            UrlShortener:{
                path:'url',
                exact:true
            },
            Contact:{
                path:'contact',
                exact:true
            },
            User:{
                path:'user/:username/:slug?',
                exact:true
            },
            Twibbon:{
                path:'twibbon',
                exact:true
            },
            TwibbonDetail:{
                path:'twibbon/:slug',
                exact:true
            },
            SecondScreen:{
                path:'second-screen',
                exact:true
            },
            OpenSource:{
                path:'opensource',
                exact:true
            },
            NotificationEvent:{
                path:'notification/events/:slug',
                exact:true
            },
            NotFound: '*',
        }
    },
    async getInitialURL(){
        const url = await expoGetInitialURL()
        const notCorona = url!==null && url?.match(/\/corona+/) ===null;
        if(notCorona) return url
    },
    subcribe(listener){
        const onReceiveURL = ({url})=>{
            const notCorona = typeof url === 'string' && url?.match(/\/corona+/) === null;
            if(notCorona) return listener(url)
        }
        const notificationFunction = (data) =>{
            if(data?.notification?.request?.content?.data?.url) {
                const url = data?.notification?.request?.content?.data?.url
                return listener(url);
            }
        }

        ExpoAddListener('url',onReceiveURL)
        const notificationListener = addNotificationResponseReceivedListener(notificationFunction)

        return ()=>{
            ExpoRemoveListener('url',onReceiveURL);
            notificationListener.remove();
        }
    }
}