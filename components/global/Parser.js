import React from 'react'
import {useWindowDimensions,View,Platform, Pressable} from 'react-native'
import {Text,useTheme,Divider} from '@ui-kitten/components'
import WebView from 'react-native-webview'
import HTML,{IGNORED_TAGS,domNodeToHTMLString,getClosestNodeParentByTag} from 'react-native-render-html'
import {CONTENT_URL,URL} from '@env'
import {ImageFull as Image} from '@pn/components/global/Image'
import {Buffer} from 'buffer'
import TableRenderer,{IGNORED_TAGS as TABLE_IGNORED_TAGS} from '@native-html/table-plugin'
import Syntax from 'react-native-syntax-highlighter'
import {androidstudio} from 'react-syntax-highlighter/styles/hljs'
import {openURL} from 'expo-linking'

import {AdsBanner,AdsBanners} from '@pn/components/global/Ads'
import global_style from '@pn/components/global/style'
import AutoHeightWebView from 'react-native-autoheight-webview'
import {jsStyles, openBrowser, stripHTML} from '@pn/utils/Main'

import { AuthContext } from '@pn/provider/AuthProvider';
import useRootNavigation from '../../navigation/useRootNavigation'

let Hid = [];

const Url = require('url-parse')

const GlobalImageRender=({src,dataSrc,thumbnail})=>{
    return <Image source={{uri:src}} fullSize fancybox dataSrc={{uri:dataSrc}} {...(thumbnail ? {thumbnail:{uri:thumbnail}} : {})} />
}

export const onLinkPagePress=(id,yLayout=0,scrollRef)=>{
    const filter = Hid.filter(i=>i.id == id);
    if(scrollRef?.current?.scrollTo && filter?.length > 0) {
        const y = filter?.[0]?.y + yLayout - 65;
        scrollRef?.current?.scrollTo({x:0,y})
    }
}

const onLinkPress=(e,href)=>{
    if(href?.match(/^javascript\:/)) return;
    const {linkTo} = useRootNavigation();
    let url = href;
    if(
        !href?.match(/^mailto\:/)
        && !href?.match(/portalnesia\.com+/)
        && !href?.match(/^\/+/)
    ) {
        url = `${URL}/link?u=${Buffer.from(encodeURIComponent(href)).toString('base64')}`
        openBrowser(url)
    } else {
        if(href?.match(/^https\:\/\/portalnesia.com/)) {
            url = href?.replace(/^https\:\/\/portalnesia.com/,'');
            linkTo(`/${url}`);
        } else if(href?.match(/^mailto\:/)) {
            openURL(href);
        } else {
            openBrowser(href,false);
        }
    }
    
}

const TextRender=(attribs,children,style,props)=>{
    if(['img','picture'].indexOf(props?.domNode?.children?.[0]?.name) !== -1 || ['a'].indexOf(props?.domNode?.children?.[0]?.name) !== -1 && typeof props?.domNode?.children?.[0]?.attribs?.['data-fancybox'] === 'string') return children;
    if(['a'].indexOf(props?.domNode?.children?.[0]?.name) !== -1) return <Text selectable={props?.selectable||false} key={props?.key} style={[global_style.container,{marginVertical:10,flexWrap:'wrap',lineHeight:23}]}>{children}</Text>
    if(props?.data && (props?.data?.length === 0 || props?.data == '&nbsp;')) return null
    return (
        <Text selectable={props?.selectable||false} key={props?.key} style={[global_style.container,{marginVertical:10,flexWrap:'wrap',lineHeight:23}]}>{(props?.domNode?.data || props.data || children)}</Text>
    )
}
const TextViewRender=(attribs,children,style,props)=>{
    return <View style={global_style.container}>{children}</View>
}

const ARender=(attribs,children,style,props)=>{
    const {href}=attribs
    if( attribs?.['data-fancybox']
        || href?.match(/^javascript\:/)
        || href?.match(/^\/+/)
    ) {
        return children
    }
    if(href?.match(/^#+/)){
        const scrollRef=props?.renderersProps?.scrollRef;
        const yLayout=props?.renderersProps?.yLayout;
        const onPress=()=>{
            onLinkPagePress(attribs?.href?.substring(1),yLayout,scrollRef)
        }
        return (
            <Pressable key={props?.key} onPress={onPress}>
                {children}
            </Pressable>
        );
    }
    
    const onPress = (evt) =>
        props.onLinkPress && attribs && attribs.href
        ? props.onLinkPress(evt, attribs.href, attribs)
        : undefined;
        return (
            <Text
            selectable={props?.selectable||false}
            onPress={onPress}
            key={props?.key}
            style={[global_style.container,style,{lineHeight:23,textDecorationLine:"underline"}]}
            status="info"
            >
            {props?.domNode?.children?.[0]?.data || props?.domNode?.data || props.data}
            </Text>
        );
}

const PictureRender=(attribs,children,style,props)=>{
    return children;
    const node = props?.domNode;
    const child = node?.children?.[node?.children?.length - 1];
    if(child?.name === 'img') {
        const {src}=child?.attribs;
        const srrrc=child?.attribs?.['data-src']||src;
        const withPng = child?.attribs?.['data-png'] == "true";
        const srrc=!srrrc?.match(/portalnesia\.com\/+/) && !srrrc?.match(/^\/+/) ? `${CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=400${withPng ? '&output=png' : ''}` : `${srrrc}${withPng ? '&output=png' : ''}`;
        //console.log(srrc);
        return <View key={props?.key} style={{marginTop:10}}><GlobalImageRender src={srrc} /></View>
    }
    return children;
}
const TableRender=(attribs,children,style,props)=>{
    return TableRenderer(attribs,children,style,props)
}

const CaptionRender=(attribs,children,style,props)=>{
    return (
        <Text selectable={props?.selectable||false} key={props?.key} appearance="hint" category="c1" style={[global_style.container,{flexWrap:'wrap'}]}>{props?.domNode?.children?.[0]?.data||props?.data||children}</Text>
    )
}

const StrongRenderer=(attribs,children,style,props)=>{
    if(props?.domNode?.data) return <Text selectable={props?.selectable||false} key={props?.key} style={[{marginVertical:10,fontWeight:'700',lineHeight:23}]}>{props?.domNode?.data||children||props?.data}</Text>
    return children
}

const IRenderer=(attribs,children,style,props)=>{
    if(props?.domNode?.data) return <Text selectable={props?.selectable||false} key={props?.key} style={[{marginVertical:10,lineHeight:23,fontStyle:'italic'}]}>{props?.domNode?.data||children||props?.data}</Text>
    return children
}

const HrRender=(attribs,children,style,props)=><Divider style={{backgroundColor:props?.renderersProps?.theme['border-text-color']}} key={props?.key} />

const ImageRender=(attribs,children,style,props)=>{
    const node = props?.domNode;
    const aa = getClosestNodeParentByTag(node,"a");
    const {src}=node?.attribs;
    const withPng = node?.attribs?.['data-png'] == "true";
    const srrrc=node?.attribs?.['data-src']||src;
    const dtSrc = aa !== null && aa?.attribs?.['data-src'] ? `${aa?.attribs?.['data-src']}${withPng ? '&output=png' : ''}` : `${srrrc}${withPng ? '&output=png' : ''}`;
    const dtCaption = aa !== null && aa?.attribs?.['data-caption'] ? aa?.attribs?.['data-caption'] : "";
    const srrc=!srrrc?.match(/portalnesia\.com\/+/) ? `${CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=400${withPng ? '&output=png' : '&output=webp'}` : `${srrrc}${withPng ? '&output=png' : ''}`;
    let thumb;
    if(!withPng) {
        if(!srrrc?.match(/portalnesia\.com\/+/)) thumb = `${CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=50`;
        else {
            const UrlParse = new Url(srrrc,true);
            const imgWid = UrlParse?.query?.size;
            let ssrc = imgWid ? srrrc.replace(`&size=${imgWid}`,'') : srrrc;
            ssrc = imgWid ? srrrc.replace(`?size=${imgWid}`,'?') : srrrc;
            thumb = `${ssrc}&size=50`
        }
    } else thumb=undefined
    //console.log(thumb);
    return <View key={props?.key} style={{marginTop:10,justifyContent:'center',alignItems:'center'}}><GlobalImageRender src={srrc} dataSrc={dtSrc} thumbnail={thumb} caption={dtCaption} /></View>
}

const HRender=(type)=>(attribs,children,style,props)=>{
    const scrollRef=props?.renderersProps?.scrollRef;
    const yLayout=props?.renderersProps?.yLayout;
    const onReceiveId=props?.renderersProps?.onReceiveId;
    const heading = type=='h1' ? 'h3' : type == 'h3' ? 'h5' : 'h4';
    let id;
    const name = stripHTML(domNodeToHTMLString(props?.domNode))?.replace(/\n/g,'')
    const block = getClosestNodeParentByTag(props?.domNode,"blockquote");
    
    if(attribs?.id) {
        id = attribs?.id;
    } else {
        id = name.split(' ').slice(0,3).join(' ');
        id = jsStyles(id);
    }
    const withTableClass = props?.domNode?.attribs?.class?.match(/no-table-content/);
    const withTable = withTableClass === undefined || withTableClass === null;
    const withUnderlineClass = props?.domNode?.attribs?.class?.match(/no-underline/);
    const withUnderline = withUnderlineClass === undefined || withUnderlineClass === null;
    const onLayout=(e)=>{
        if(e?.nativeEvent?.layout?.y && typeof block === 'undefined' && withTable && name?.match(/\S/) !==null) {
            const index = Hid.findIndex(i=>i.id == id);
            if(index == -1) {
                Hid = Hid.concat({id,tag:heading,y:e?.nativeEvent?.layout?.y,name})
            } else {
                Hid[index]={id,tag:heading,y:e?.nativeEvent?.layout?.y,name}
            }
            if(onReceiveId) onReceiveId(Hid);
        }
    }

    return (
        <View key={props?.key} onLayout={onLayout} >
            <Text onPress={()=>typeof block === 'undefined' && withTable && onLinkPagePress(id,yLayout,scrollRef)} selectable={props?.selectable||false} category={heading} style={[global_style.container,{marginTop:20,...(withUnderline ? {paddingBottom:5,borderBottomColor:props?.renderersProps?.theme['border-text-color'],borderBottomWidth:2} : {})}]}>{children||props?.data}</Text>
        </View>
    )
}

const DivRender=(attribs,children,style,props)=>{
    if(attribs?.class == 'article__image-caption') {
        return CaptionRender(attribs,children,style,props)
    }
    else if(attribs?.['data-portalnesia-action']) {
        if(!props?.renderersProps?.iklan) return null
        if(attribs?.['data-portalnesia-action']=='ads') {
            const type=attribs?.['data-ads'];
            if(type=='300') return <AdsBanner key={`ads-1-${props?.key}`} />
            else if(type=='468' || type=='728') return <AdsBanners key={`ads-2-${props?.key}`} size="MEDIUM_RECTANGLE" />
            return null
        }
        return null
    } else if(attribs?.class == 'table-responsive') {
        return TableRender(attribs,children,style,props)
    } else {
        return children
    }
}

const IframeRender=(attribs,children,style,props)=>{
    const {src,width,height} = attribs
    if(!width || !height) {
        return (
            <WebView
                allowsFullscreenVideo
                key={props?.key}
                style={{ width: props?.renderersProps?.screenWidth, marginVertical: 10,marginHorizontal:15}}
                source={{uri:src}}
                //viewportContent={'width=device-width, user-scalable=no'}
            />
        )
    }
    const ratio = Number(height)/Number(width)
    return (
        <View key={props?.key} style={{width:props?.renderersProps?.screenWidth,height:Number((props?.renderersProps?.screenWidth * ratio))}}>
            <WebView source={{uri:src}} allowsFullscreenVideo style={{opacity:0.99,overflow:'hidden'}} />
        </View>
    )
}

const CodeRender=(attribs,children,style,props)=>{
    let data
    if(props?.domNode?.children?.[0]?.data) {
        data = props?.domNode?.children?.[0]?.data

        if(attribs?.class && attribs?.class?.match(/language\-(\w+)/) !== null) {
            const lang = attribs?.class?.match(/language\-(\w+)/)
            return (
                <View key={props?.key} style={[global_style.container,{width:props?.renderersProps?.screenWidth}]}>
                    <Syntax language={(lang[0] === 'js' ? 'javascript' : lang[0])} fontSize={14} style={androidstudio} customStyle={{borderRadius:5,padding:0}} codeTagProps={{style:{padding:8}}}>{data}</Syntax>
                </View>
            )
        }

        data = <Text selectable={props?.selectable||false} style={{...(props?.tagsStyles?.code||{}),lineHeight:23}}>{data}</Text>
    } else {
        data = children||props?.data
    }

    return (
        <View key={props?.key} style={[global_style.container,{width:props?.renderersProps?.screenWidth}]}>
            <View style={{flex:1,borderRadius:5,backgroundColor:'#282B2E',padding:8,overflow:'scroll'}}>
                {data}
            </View>
        </View>
    )
}

const BlockRender=(attribs,children,style,props)=>{
    const selectedTheme=props?.renderersProps?.selectedTheme;
    if(attribs?.class == "tiktok-embed") {
        let ht = domNodeToHTMLString(props?.domNode);
        let html=`<script async src="https://www.tiktok.com/embed.js"></script>${ht}`;
        //const customScript=``
        return (
            <AutoHeightWebView
                key={props?.key}
                style={{ width: props?.renderersProps?.screenWidth - 10, marginVertical: 20,marginHorizontal:5 }}
                source={{html,baseUrl:"https://www.tiktok.com"}}
                javaScriptEnabled
                viewportContent={'width=device-width, user-scalable=no'}
            />
        )
    }
    if(attribs?.class == "twitter-tweet") {
        let ht = domNodeToHTMLString(props?.domNode);
        ht = ht.replace("<blockquote ",`<blockquote data-theme="${selectedTheme}"`)
        let html=`<script async src="https://platform.twitter.com/widgets.js"></script>${ht}`;
        //const customScript=``
        return (
            <AutoHeightWebView
                key={props?.key}
                style={{ width: props?.renderersProps?.screenWidth - 10, marginVertical: 20,marginHorizontal:5 }}
                source={{html,baseUrl:"https://platform.twitter.com"}}
                javaScriptEnabled
                viewportContent={'width=device-width, user-scalable=no'}
            />
        )
    }
    if(attribs?.class == "instagram-media") {
        let ht = domNodeToHTMLString(props?.domNode);
        let html=`<script async src="https://www.instagram.com/static/bundles/metro/EmbedSDK.js/33cd2c5d5d59.js"></script>${ht}`;
        return (
            <AutoHeightWebView
                key={props?.key}
                style={{ width: props?.renderersProps?.screenWidth - 10, marginVertical: 20,marginHorizontal:5 }}
                source={{html,baseUrl:"https://www.instagram.com"}}
                javaScriptEnabled
                injectedJavaScript={`
                    window.onload=function(){
                        instgrm.Embeds.process();
                    }
                `}
                viewportContent={'width=device-width, user-scalable=no'}
            />
        )
    }
    let data
    if(props?.domNode?.children?.[0]?.data && props?.domNode?.children?.[0]?.data.match(/\S/g) !== null) {
        data = props?.domNode?.children?.[0]?.data
        data = <Text selectable={props?.selectable||false} style={{...(props?.tagsStyles?.code||{}),lineHeight:23}}>{data}</Text>
    }
    else {
        data = children||props?.data
    }

    return (
        <View key={props?.key} style={[global_style.container,{width:props?.renderersProps?.screenWidth}]}>
            <View style={{flex:1,borderRadius:5,backgroundColor:props?.renderersProps?.theme['color-code-background'],padding:8,borderLeftColor:props?.renderersProps?.theme['color-code-border'],borderLeftWidth:5}}>
                {data}
            </View>
        </View>
    )
}

const FigureRender=(attribs,children,style,props)=>children

export const Parser=React.memo(({source,selectable=false,iklan=true,scrollRef,yLayout=0,onReceiveId})=>{
    const {width: screenWidth} = useWindowDimensions()
    const theme = useTheme()
    const context = React.useContext(AuthContext);
    const {theme:selectedTheme} = context
    //const context = React.useContext(AuthContext)
    //const {setNotif} = context
    //const [TableContent,setTableContent]=React.useState([]);

    /*const onLayout=(evt,title)=>{
        evt.persist()
        if(title) {
            setTableContent((prev)=>prev.concat([{...evt?.nativeEvent?.layout,title:title}]))
        }
    }*/

    
    
    /*
    <View key={props?.key} onLayout={(e)=>{
        if(typeof onLayout === 'function') onLayout(e,props?.domNode?.children?.[0]?.data)
    }}>
        <Text category={heading} style={{marginTop:20,marginBottom:20}}>{props?.domNode?.children?.[0]?.data||children||props?.data}</Text>
    </View>
    */

    const renderers={
        table:{renderer:TableRender,wrapper:"Text"},
        p:{renderer:TextRender,wrapper:'View'},
        //p:{renderer:TextRender,wrapper:'View'},
        a:{renderer:ARender,wrapper:"View"},
        //a:{renderer:ARenderView,wrapper:"View"},
        h1:{renderer:HRender('h1'),wrapper:'Text'},
        h2:{renderer:HRender('h2'),wrapper:'Text'},
        h3:{renderer:HRender('h3'),wrapper:'Text'},
        h4:{renderer:HRender('h4'),wrapper:'Text'},
        figcaption:{renderer:CaptionRender,wrapper:"View"},
        strong:{renderer:StrongRenderer,wrapper:"Text"},
        b:{renderer:StrongRenderer,wrapper:"Text"},
        i:{renderer:IRenderer,wrapper:"Text"},
        em:{renderer:IRenderer,wrapper:"Text"},
        div:{renderer:DivRender,wrapper:"View"},
        iframe:{renderer:IframeRender,wrapper:"View"},
        picture:{renderer:PictureRender,wrapper:"View"},
        img:{renderer:ImageRender,wrapper:"View"},
        hr:{renderer:HrRender,wrapper:"View"},
        code:{renderer:CodeRender,wrapper:"Text"},
        blockquote:{renderer:BlockRender,wrapper:"Text"},
        figure:{renderer:FigureRender,wrapper:"View"},
    }

    const rendererProps={
        theme,
        iklan,
        screenWidth,
        selectedTheme,
        scrollRef,
        yLayout,
        onReceiveId
    }

    const alterData=(node)=>{
        const {parent,data} = node
        if(parent?.name=='code') {
            return data.replace(/REPLACER_N/g,"<br>")
        }
    }
    const onParsed=(dom,RNElement)=>{
        return RNElement;
    }
    
    const htmlProps={
        renderers:renderers,
        ignoredTags:[...IGNORED_TAGS,...TABLE_IGNORED_TAGS],
        contentWidth:screenWidth,
        WebView,
        defaultTextProps:{flexWrap:'wrap',fontSize:15,color:theme['text-basic-color'],selectable:selectable||false},
        onLinkPress:onLinkPress,
        defaultWebViewProps:{style:{opacity:0.99,overflow:'hidden'}},
        onParsed:onParsed
    }

    React.useEffect(()=>{
        return ()=>{
            Hid = [];
        }
    },[source])

    return (
        <HTML
            source={{html:source}}
            tagsStyles={{
                code:{
                    fontFamily:(Platform.OS ==  'ios' ? 'Menlo-Regular' : 'monospace'),
                    fontSize:14
                },
                p:{
                    fontSize:15,
                    color:theme['text-basic-color']
                },
                ul:{
                    fontSize:15,
                    color:theme['text-basic-color'],
                },
                li:{
                    fontSize:15,
                    color:theme['text-basic-color'],
                    lineHeight:23
                },
                a:{
                    color:theme['link-color'],
                    fontSize:15,
                }
            }}
            listsPrefixesRenderers={{
                ul:()=>(
                    <View
                        style={{
                            marginRight: 10,
                            width: 15 / 2.8,
                            height: 15 / 2.8,
                            marginTop: 15 / 1.5,
                            borderRadius: 15 / 2.8,
                            backgroundColor: theme['text-basic-color'],
                        }}
                    />
                ),
                ol:(a,b,c,props)=>(
                    <Text
                        style={{ marginRight: 5, fontSize:15,marginTop:1 }}
                    >
                        {props?.index + 1})
                    </Text>
                )
            }}
            renderersProps={rendererProps}
            {...htmlProps}
        />
    )
})

export const Markdown=({source,skipHtml,selectable=false,iklan=true})=>{
    const marked=require('marked');
    const sanitizeHtml = require('sanitize-html')
    const html = React.useMemo(()=>{
        marked.setOptions({
            breaks:true
        })
        const hhtm = marked(source)
        const allowedTags=['p','h1','h2','h3','figcaption','b','strong','li','ul','ol','em','i','hr','pre','code','a','br','small','span','caption','table','tbody','thead','td','tr','tfoot'];
        const allowed = skipHtml ? allowedTags : allowedTags.concat(['img','iframe']);
        return sanitizeHtml(hhtm,{
            allowedTags:allowed,
            allowedSchemes:['https','mailto','tel','pn'],
            allowedAttributes:false,
            disallowedTagsMode:'escape',
            allowedSchemesAppliedToAttributes:['href','src','cite','data-*','srcset'],
        })
        //return hhtm;
        //return DOMpurify.sanitize(hhtm, {FORBID_TAGS: forb,USE_PROFILES: {html: true}})
    },[source,skipHtml])

    return <Parser source={html} selectable={selectable} iklan={iklan} />
}