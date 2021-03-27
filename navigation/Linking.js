import {createURL,getInitialURL as expoGetInitialURL,addEventListener as ExpoAddListener} from 'expo-linking'

export const linking = {
    prefixes:[createURL('/'),'https://portalnesia.com'],
    config:{
        Main:{
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
                    }
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
                UrlShortener:{
                    path:'url',
                    exact:true
                },
                Contact:{
                    path:'contact',
                    exact:true
                }
            }
        }
    },
    async getInitialURL(){
        const url = await expoGetInitialURL()
        if(url !== null) return url
    },
    subcribe(listener){
        const onReceiveURL = ({url})=>{
            console.log(url)
            return listener(url)
        }

        ExpoAddListener('url',onReceiveURL)
    }
}