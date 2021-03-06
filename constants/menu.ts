import i18nn from 'i18n-js'
import {UserType} from '@pn/types/UserTypes'

const userMenu=(i18n: typeof i18nn,user: UserType)=>([
    {
        title: "Accounts",
        menu:[
            {
                title:"Likes",
                to:"/like",
                icon:['heart']
            },
        ]
    }
])

export const menu=(i18n: typeof i18nn,user: UserType)=>([
    ...(user ? userMenu(i18n,user) : []),
    {
        title:"Menu",
        menu:[
            {
                title:"Twitter Thread Reader",
                to:"/twitter/thread",
                icon:['twitter','font_awesome']
            },
            {
                title:"Geodata",
                icon:["terrain","material"],
                menu:[
                    {
                        title:"Transform Coordinate",
                        to:"/geodata/transform"
                    }
                ]
            },
            {
                title:"Tools",
                icon:['tools','font_awesome'],
                menu:[
                    {
                        title:"Tuner",
                        to:"/TunerScreen"
                    },
                    {
                        title:"QR Code Generator",
                        to:"/qr-code"
                    },
                    {
                        title:"Random Number Generator",
                        to:"/random-number"
                    },
                    {
                        title:"Parse HTML",
                        to:"/parse-html"
                    },
                    /*{
                        title:"Downloader",
                        //to:"Downloader"
                    },*/
                    {
                        title:"Images Checker",
                        to:"/images-checker"
                    },
                    /*{
                        title:"Twitter Menfess",
                        //to:"Twitter Menfess"
                    },*/
                ]
            },
            /*{
                title:"Events",
                icon:['event','material'],
                menu:[
                    {
                        title:"Calendar",
                        //to:"Calendar"
                    }
                ]
            },*/
            {
                title:"URL Shortener",
                to:"/url",
                //link:"pn://pages/terms-of-service",
                icon:['link','font_awesome'],
            },
            {
                title:"Blog",
                to:"/blog",
                icon:['article','material'],
            },
            {
                title:"Twibbon",
                to:"/twibbon",
                icon:['ios-image','ionicons'],
            },
        ]
    },
    {
        title:"Others",
        menu:[
            {
                title:i18n.t("check_update"),
                to:"CheckUpdate",
                //icon:['update','material'],
            },
            {
                title:i18n.t("feedback"),
                to:"SendFeedback",
            },
            {
                title:i18n.t("donate"),
                link:"https://paypal.me/adityatranasuta",
                //icon:['donate','font_awesome'],
            },
        ]
    },
])