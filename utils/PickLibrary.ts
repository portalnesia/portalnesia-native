import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import i18n from 'i18n-js'

type ImageInfo = {
    uri: string;
    width: number;
    height: number;
    type?: 'image' | 'video';
    exif?: {
        [key: string]: any;
    };
    base64?: string;
};

type ExtendsResult = {
    exists: boolean,
    size?: number
}

type PickImageResult = {
    cancelled:true
} | ({
    cancelled:false,
} & ImageInfo & ExtendsResult)

export async function pickImage(options: ImagePicker.ImagePickerOptions): Promise<PickImageResult> {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status !== 'granted') throw {type:1,message:i18n.t('errors.permission_storage')}

    const image = await ImagePicker.launchImageLibraryAsync(options);
    if(image.cancelled) throw {type:0}

    const fs = await FileSystem.getInfoAsync(image.uri);
    
    const result: PickImageResult = {
        exists:fs.exists,
        size:fs.size,
        ...image,
        uri:image.uri.replace("file:","file://")
    };

    return result;
}