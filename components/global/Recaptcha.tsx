import React from 'react'
import { Platform,View } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import {RECAPTCHA_SITEKEY,URL} from '@env'

const patchPostMessageJsCode = `
    (function(){
        const originalPostMessage = window.postMessage
        const patchedPostMessage = (message: any, targetOrigin: any, transfer: any) => {
            originalPostMessage(message, targetOrigin, transfer)
        }
        patchedPostMessage.toString = () => String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
        window.postMessage = patchedPostMessage
    })();
`

const getExecutionFunction = (siteKey: string, action: string) => {
    return `window.grecaptcha.execute('${siteKey}', { action: '${action}' }).then(
      function(args) {
        let dt = {type:'token',token:args};
        window.ReactNativeWebView.postMessage(JSON.stringify(dt));
      }
    )`
}

const getInvisibleRecaptchaContent = (siteKey: string) => {
    return `<!DOCTYPE html><html><head>
      <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
      <script>
        window.grecaptcha.ready(function() {
            let dt = {type:'ready'};
            window.ReactNativeWebView.postMessage(JSON.stringify(dt));
        });</script>
      </head></html>`
}

export interface RecaptchaProps {
    onReceiveToken?:(token:string)=>void,
    action?:string,
    onReady?(): void;
}

export default class Recaptcha extends React.PureComponent<RecaptchaProps>{
    private promise: null | ((value: string | PromiseLike<string>) => void)
    private webViewRef: React.RefObject<WebView>

    constructor(props: RecaptchaProps){
        super(props)
        this.webViewRef=React.createRef<WebView>()
    }

    static defaultProps={
        action:"social",
        onReceiveToken:()=>{},
        onReady:()=>{}
    }

    refreshToken() {
        if (Platform.OS === 'ios' && this.webViewRef.current !== null) {
            this.webViewRef.current.injectJavaScript(getExecutionFunction(RECAPTCHA_SITEKEY, this.props.action||""))
        } else if (Platform.OS === 'android' && this.webViewRef.current !== null) {
            this.webViewRef.current.reload()
        }
    }

    getToken() {
        return new Promise<string>((res)=>{
            this.promise = res;
            this.webViewRef.current.injectJavaScript(getExecutionFunction(RECAPTCHA_SITEKEY, this.props.action||""));
        })
        .catch(e=>{
            throw e;
        })
    }

    private onMessage(e: WebViewMessageEvent) {
        const msg = JSON.parse(e.nativeEvent.data);
        if(msg?.type === 'ready') {
            this.props.onReady && this.props.onReady();
        } else if(msg?.type === 'token') {
            if(this.promise !== null) {
                this.promise(msg?.token);
                this.promise = null;
            }
        }
    }

    render() {
        return (
            <View style={{flex: 0.0001, width: 0, height: 0}}>
                <WebView
                    ref={this.webViewRef}
                    javaScriptEnabled
                    originWhitelist={['*']}
                    automaticallyAdjustContentInsets
                    mixedContentMode={'always'}
                    injectedJavaScript={patchPostMessageJsCode}
                    source={{
                        html: getInvisibleRecaptchaContent(RECAPTCHA_SITEKEY),
                        baseUrl: URL
                    }}
                    onMessage={(e: WebViewMessageEvent) => this.onMessage(e)}
                />
            </View>
        )
    }
}