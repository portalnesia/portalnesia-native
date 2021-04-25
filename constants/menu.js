export const menu=(i18n)=>([
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
                title:i18n.t("contact"),
                to:"/contact",
                //icon:['contact-support','material'],
            },
            {
                title:i18n.t("check_update"),
                to:"CheckUpdate",
                //icon:['update','material'],
            },
            {
                title:i18n.t("terms_of_service"),
                to:"/pages/terms-of-service?navbar=Terms of Service",
                params:{
                    navbar:"Terms of Service",
                    slug:"terms-of-service"
                }
            },
            {
                title:i18n.t("privacy_policy"),
                to:"/pages/privacy-policy?navbar=Privacy Policy",
                params:{
                    slug:"privacy-policy",
                    navbar:"Privacy Policy"
                }
                //icon:['privacy-tip','material'],
            },
            {
                title:i18n.t("donate"),
                link:"https://paypal.me/adityatranasuta",
                //icon:['donate','font_awesome'],
            },
            {
                title:"Open Source Libraries",
                to:"/opensource",
                //to:"NewsDetail",
                //params:{source:'liputan6',title:'Patung+Nyi+Roro+Kidul+Muncul+Secara+Misterius+di+Pantai+Nusa+Dua'}
            }
        ]
    },
])