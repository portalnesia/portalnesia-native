import React from 'react'
import { Platform,View } from 'react-native'
import { WebView } from 'react-native-webview'

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

const getExecutionFunction = (siteKey, action) => {
    return `window.grecaptcha.execute('${siteKey}', { action: '${action}' }).then(
      function(args) {
        window.ReactNativeWebView.postMessage(args);
      }
    )`
}

const getInvisibleRecaptchaContent = (siteKey, action) => {
    return `<!DOCTYPE html><html><head>
      <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
      <script>window.grecaptcha.ready(function() { ${getExecutionFunction(siteKey, action)} });</script>
      </head></html>`
}

export default class Recaptcha extends React.Component{

    constructor(props){
        super(props)
        this.webViewRef=React.createRef(null)
    }

    static defaultProps={
        action:"social",
        onReceiveToken:()=>{}
    }

    refreshToken() {
        if (Platform.OS === 'ios' && this.webViewRef.current !== null) {
            this.webViewRef.current.injectJavaScript(getExecutionFunction(this.props.siteKey, this.props.action))
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
                    html: getInvisibleRecaptchaContent("6LdeqPYUAAAAAL-nPJZjgAE0gYD5DeyH7-i-_Hee", this.props.action),
                    baseUrl: 'https://portalnesia.com'
                }}
                onMessage={(e) => {
                    this.props.onReceiveToken(e.nativeEvent.data)
                }}/>
            </View>
        )
    }
}