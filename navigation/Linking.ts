import { LinkingOptions } from '@react-navigation/native';
import {createURL,getInitialURL as expoGetInitialURL} from 'expo-linking'

export const getLink=(link: string,a=true)=>{
    let url = link.replace("https://portalnesia.com/","");
    url = url.replace("pn://","");
    const uri = url.split("?")[0];
    const split = uri.split("/")[0];
    let firstPath='';
    if(split === 'news') firstPath='NewsStack';
    else if(split==='chord') firstPath='ChordStack';
    else if(split==='search') firstPath='SearchPath';
    else if(['pages','setting','contact','url','blog','twibbon','login-callback','twitter'].indexOf(split) !== -1) firstPath='MenuStack';
    else firstPath="HomeStack";
    const finalPath = a ? `https://portalnesia.com/MainStack/MainTab/${firstPath}/${url}` : `/MainStack/MainTab/${firstPath}/${url}`
    return finalPath;
}

const getScreen={
    Setting:{
        path:'setting',
    },
    NewsDetail:{
        path:'news/:source/:title',
    },
    ChordList:{
        path:'chord/artist/:slug?',
    },
    ChordDetail:{
        path:'chord/:slug',
    },
    Blog:{
        path:'blog',
    },
    BlogDetail:{
        path:'blog/:slug',
    },
    BlogList:{
        path:'blog/:blogType/:slug',
    },
    Pages:{
        path:'pages/:slug',
    },
    Twitter:{
        path:'twitter/thread',
    },
    TwitterThread:{
        path:'twitter/thread/:slug',
    },
    GeodataTransform:{
        path:'geodata/transform',
    },
    NumberGenerator:{
        path:'random-number',
    },
    ParseHtml:{
        path:'parse-html',
    },
    ImagesChecker:{
        path:'images-checker',
    },
    QrGenerator:{
        path:'qr-code/:slug?',
    },
    UrlShortener:{
        path:'url',
    },
    Contact:{
        path:'contact',
    },
    User:{
        path:'user/:username/:slug?',
    },
    Twibbon:{
        path:'twibbon',
    },
    TwibbonDetail:{
        path:'twibbon/:slug',
    },
    SecondScreen:{
        path:'second-screen',
    },
    OpenSource:{
        path:'opensource',
    },
    NotificationEvent:{
        path:'notification/events/:slug',
    },
    NotFound: '*',
}

export const linking: LinkingOptions = {
    prefixes:[createURL('/'),'https://portalnesia.com'],
    config:{
        screens:{
            MainStack:{
                path:'MainStack',
                screens:{
                    MainTab:{
                        path:'MainTab',
                        screens:{
                            HomeStack:{
                                path:'HomeStack',
                                screens:{
                                    Home:{
                                        path:'',
                                    },
                                    ...getScreen
                                }
                            },
                            NewsStack:{
                                path:'NewsStack',
                                screens:{
                                    News:{
                                        path:'news',
                                    },
                                    ...getScreen
                                }
                            },
                            ChordStack:{
                                path:'ChordStack',
                                screens:{
                                    Chord:{
                                        path:'chord',
                                    },
                                    ...getScreen
                                }
                            },
                            SearchStack:{
                                path:'SearchStack',
                                screens:{
                                    Search:{
                                        path:'search',
                                    },
                                    ...getScreen
                                }
                            },
                            MenuStack:{
                                path:'MenuStack',
                                screens:{
                                    Menu:{
                                        path:'login-callback',
                                    },
                                    ...getScreen
                                }
                            },
                        }
                    },
                    ReportScreen:{
                        path:'ReportScreen'
                    }
                }
            }
        }
    },
    async getInitialURL(){
        const url = await expoGetInitialURL()
        if(url!==null && url?.match(/\/corona+/) ===null) {
            return getLink(url)
        }
    },
}