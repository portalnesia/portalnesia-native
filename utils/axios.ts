import {API as APII} from '@env'
import axios from 'axios'
import * as Application from 'expo-application'
import {Constants} from 'react-native-unimodules'

const API = axios.create({
    baseURL:APII,
    timeout:10000,
    headers: {
        'X-Application-Version': Constants.nativeAppVersion,
        'X-Device-Id': Application.androidId,
        'X-Session-Id':Application.androidId
    }
})

export default API;