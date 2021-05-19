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
        window.ReactNativeWebView.postMessage(args);
      }
    )`
}

const getInvisibleRecaptchaContent = (siteKey: string, action: string) => {
    return `<!DOCTYPE html><html><head>
      <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
      <script>window.grecaptcha.ready(function() { ${getExecutionFunction(siteKey, action)} });</script>
      </head></html>`
}

export interface RecaptchaProps {
    onReceiveToken?:(token:string)=>void,
    action?:string,

}

export default class Recaptcha extends React.PureComponent<RecaptchaProps>{

    private webViewRef: React.RefObject<WebView>

    constructor(props: RecaptchaProps){
        super(props)
        this.webViewRef=React.createRef<WebView>()
    }

    static defaultProps={
        action:"social",
        onReceiveToken:()=>{}
    }

    refreshToken() {
        if (Platform.OS === 'ios' && this.webViewRef.current !== null) {
            this.webViewRef.current.injectJavaScript(getExecutionFunction(RECAPTCHA_SITEKEY, this.props.action||""))
        } else if (Platform.OS === 'android' && this.webViewRef.current !== null) {
            this.webViewRef.current.reload()
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
                        html: getInvisibleRecaptchaContent(RECAPTCHA_SITEKEY, this.props.action||""),
                        baseUrl: URL
                    }}
                    onMessage={(e: WebViewMessageEvent) => {
                        this.props.onReceiveToken && this.props.onReceiveToken(e.nativeEvent.data)
                    }}
                />
            </View>
        )
    }
}