import { LinkingOptions } from '@react-navigation/native';
import {createURL,getInitialURL as expoGetInitialURL} from 'expo-linking'

const getScreen={
    Setting:{
        path:'setting',
    },
    AccountSettingScreen:{
        path:'setting/account',
    },
    SecuritySettingScreen:{
        path:'setting/security',
    },
    NotificationSettingScreen:{
        path:'setting/notification',
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
    Tuner:{
        path:'TunerScreen',
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
    Like:{
        path:'like/:filter?',
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
                    },
                    EditUserScreen:{
                        path:"user/:username/edit",
                        exact:true
                    },
                    Login:{
                        path:"login",
                        exact:true
                    },
                    Register:{
                        path:"register",
                        exact:true
                    },
                    Authentication:{
                        path:"authentication",
                        exact:true
                    },
                    ForgetPassword:{
                        path:"forgot",
                        exact:true
                    },
                    ForgetPasswordForm:{
                        path:"forgot/:token",
                        exact:true
                    },
                    
                }
            }
        }
    },
}