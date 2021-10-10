import {Constants} from 'react-native-unimodules'
import * as Device from 'expo-device'
import * as Cellular from 'expo-cellular'

export default function getInfo() {
    return {
        buildVersion:Constants.nativeBuildVersion,
        packageVersion:Constants.nativeAppVersion,
        jsVersion:Constants.manifest.version,
        device:Device.designName,
        buildID:Device.osBuildId,
        buildFingerPrint:Device.osBuildFingerprint,
        model:Device.modelName,
        product: Device.productName,
        sdkVersion:Device.platformApiLevel,
        brand:Device.brand,
        networkProvider:Cellular.carrier,
        mccCode:Cellular.mobileCountryCode,
        mncCode:Cellular.mobileNetworkCode,
        osVersion: Device.osVersion
    }
}