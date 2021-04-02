export const menu=[
    {
        title:"Menu",
        menu:[
            {
                title:"Twitter Thread Reader",
                to:"Twitter",
                icon:['twitter','font_awesome']
            },
            {
                title:"Geodata",
                icon:["terrain","material"],
                menu:[
                    {
                        title:"Transform Coordinate",
                        to:"GeodataTransform"
                    }
                ]
            },
            {
                title:"Tools",
                icon:['tools','font_awesome'],
                menu:[
                    {
                        title:"QR Code Generator",
                        to:"QrGenerator"
                    },
                    {
                        title:"Random Number Generator",
                        to:"NumberGenerator"
                    },
                    {
                        title:"Parse HTML",
                        to:"ParseHtml"
                    },
                    /*{
                        title:"Downloader",
                        //to:"Downloader"
                    },*/
                    {
                        title:"Images Checker",
                        to:"ImagesChecker"
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
                //to:"ImageModal",
                to:"UrlShortener",
                //link:"exp://192.168.1.6:19000/--/pages/terms-of-service",
                icon:['link','font_awesome'],
            },
            {
                title:"Blog",
                to:"Blog",
                icon:['article','material'],
            },
        ]
    },
    {
        title:"Others",
        menu:[
            {
                title:"Contact",
                to:"Contact",
                //icon:['contact-support','material'],
            },
            {
                title:"Check Update",
                to:"CheckUpdate",
                //to:"User",
                //params:{username:'putuaditya_sid'}
                //icon:['update','material'],
            },
            {
                title:"Terms of Services",
                to:"Pages",
                params:{
                    navbar:"Terms of Service",
                    slug:"terms-of-service"
                }
            },
            {
                title:"Privacy Policy",
                to:"Pages",
                params:{
                    slug:"privacy-policy",
                    navbar:"Privacy Policy"
                }
                //icon:['privacy-tip','material'],
            },
            {
                title:"Donate",
                link:"https://paypal.me/adityatranasuta",
                //icon:['donate','font_awesome'],
            }
        ]
    },
]