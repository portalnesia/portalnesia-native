import i18n from 'i18n-js'
import {default as en_locale} from '@pn/locale/en.json'
import {default as id_locale} from '@pn/locale/id.json'

i18n.defaultLocale = "en-US"
i18n.locale = 'en-US';
i18n.translations = {
	en:en_locale,
	id:id_locale
};
i18n.fallbacks = true;

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
                to:"UrlShortener",
                //link:"pn://pages/terms-of-service",
                icon:['link','font_awesome'],
            },
            {
                title:"Blog",
                to:"Blog",
                icon:['article','material'],
            },
            {
                title:"Twibbon",
                to:"Twibbon",
                icon:['ios-image','ionicons'],
            },
        ]
    },
    {
        title:"Others",
        menu:[
            {
                title:i18n.t("contact"),
                to:"Contact",
                //icon:['contact-support','material'],
            },
            {
                title:i18n.t("check_update"),
                to:"CheckUpdate",
                //icon:['update','material'],
            },
            {
                title:i18n.t("terms_of_service"),
                to:"Pages",
                params:{
                    navbar:"Terms of Service",
                    slug:"terms-of-service"
                }
            },
            {
                title:i18n.t("privacy_policy"),
                to:"Pages",
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
            }
        ]
    },
]