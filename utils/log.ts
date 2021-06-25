import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'

export async function log(name:string,extra?: Record<string,any>){
    crashlytics().log(name);
    await analytics().logEvent(name,extra);
}

export function logError(e: Error,name: string) {
    console.log(name,e);
    crashlytics().recordError(e,name)
}