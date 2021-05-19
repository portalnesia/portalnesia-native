import * as ExLocation from 'expo-location'
import i18n from 'i18n-js'

async function initRequest(){
    const hasService = await ExLocation.hasServicesEnabledAsync();
    if(!hasService) return {message:i18n.t('errors.location_disabled')}

    const permission = await ExLocation.requestPermissionsAsync();
    if(permission.status === 'denied') return {message:i18n.t('errors.permission_location')}
    return true;
}

export async function getLocation(options?: ExLocation.LocationOptions):Promise<ExLocation.LocationObject> {
    const init = await initRequest();
    if(init !== true) throw init;

    return await ExLocation.getCurrentPositionAsync(options);
}

export async function getLastLocation(options?: ExLocation.LocationLastKnownOptions):Promise<ExLocation.LocationObject | null>{
    const init = await initRequest();
    if(init !== true) throw init;

    return await ExLocation.getLastKnownPositionAsync(options);
}

export async function watchLocation(options: ExLocation.LocationOptions, callback: ExLocation.LocationCallback): Promise<{remove(): void}>{
    const init = await initRequest();
    if(init !== true) throw init;

    return await ExLocation.watchPositionAsync(options,callback);
}

export async function reverseGeocode(location: Pick<ExLocation.LocationGeocodedLocation, "latitude" | "longitude">): Promise<ExLocation.LocationGeocodedAddress[]>{
    return await ExLocation.reverseGeocodeAsync(location)
}

export async function geocode(address: string):Promise<ExLocation.LocationGeocodedLocation[]> {
    return await ExLocation.geocodeAsync(address)
}