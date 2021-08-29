package com.portalnesia.app;

import android.app.Activity;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.UriPermission;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;

import java.util.List;

public class PNFile extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNFile";

    private final ReactApplicationContext reactContext;

    PNFile(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void getRealPathFromSaf(String saf, Promise promise){
        try {
            Uri uri = Uri.parse(saf);
            Uri docUri = DocumentsContract.buildDocumentUriUsingTree(uri,DocumentsContract.getTreeDocumentId(uri));
            String path = getPath(reactContext,docUri);
            promise.resolve(path);
        } catch(Throwable e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getUriPermission(Promise promise) {
        try {
            List<UriPermission> uris = reactContext.getContentResolver().getPersistedUriPermissions();
            WritableNativeArray result = new WritableNativeArray();
            for(UriPermission uri : uris) {
                result.pushString(uri.getUri().toString());
            }
            promise.resolve(result);
        } catch(Throwable e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void removeUriPermission(String saf, Promise promise) {
        try {
            Uri uri = Uri.parse(saf);
            reactContext.getContentResolver().releasePersistableUriPermission(uri,3);
            promise.resolve(null);
        } catch(Throwable e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void openFolder(String location,Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if(activity == null) {
                return;
            }
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri uri = Uri.parse(location);
            intent.setDataAndType(uri,"*/*");
            activity.startActivity(intent);
            promise.resolve(null);
        } catch(Throwable e) {
            promise.reject(e);
        }
    }

    public static String getPath(final Context context, final Uri uri) {
        if(DocumentsContract.isDocumentUri(context,uri)) {
            if(isExternalStorageDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                if("primary".equals(type)) {
                    return Environment.getExternalStorageDirectory() + "/" + split[1];
                }
            }
            else if(isDownloadsDocument(uri)) {
                final String id = DocumentsContract.getDocumentId(uri);
                final Uri contentUri = ContentUris.withAppendedId(
                    Uri.parse("content://downloads/public_downloads"),Long.parseLong(id)
                );
                return getDataColumn(context,contentUri,null,null);
            }
            else if(isMediaDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];
                Uri contentUri = null;
                if("image".equals(type)) {
                    contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if("video".equals(type)) {
                    contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if("audio".equals(type)) {
                    contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }
                final String selection = "_id=?";
                final String[] selectionArgs = new String[] {
                        split[1]
                };
                return getDataColumn(context,contentUri,selection,selectionArgs);
            }
        }
        // MediaStore
        else if("content".equalsIgnoreCase(uri.getScheme())) {
            if(isGooglePhotosUri(uri)) {
                return uri.getLastPathSegment();
            }
            return getDataColumn(context,uri,null,null);
        }
        //File
        else if("file".equalsIgnoreCase(uri.getScheme())) {
            return uri.getPath();
        }
        return null;
    }

    public static String getDataColumn(Context context,Uri uri, String selection,String[] selectionArgs) {
        Cursor cursor=null;
        final String column = "_data";
        final String[] projection = {
                column
        };
        try {
            cursor = context.getContentResolver().query(uri,projection,selection,selectionArgs,null);
            if(cursor != null && cursor.moveToFirst()) {
                final int index = cursor.getColumnIndexOrThrow(column);
                return cursor.getString(index);
            }
        } finally {
            if(cursor!=null) {
                cursor.close();
            }
        }
        return null;
    }

    public static boolean isExternalStorageDocument(Uri uri){
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    public static boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    public static boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }

    public static boolean isGooglePhotosUri(Uri uri) {
        return "com.google.android.apps.photos.content".equals(uri.getAuthority());
    }
}
