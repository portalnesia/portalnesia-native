package com.portalnesia.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.portalnesia.app.share.FileProvider;
import com.portalnesia.app.share.ImageExporter;
import com.portalnesia.app.share.ImageResult;
import com.theartofdev.edmodo.cropper.CropImage;

public class PNShareModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS="PNShare";
    public static final String MIME_TYPE_KEY="mimeType";
    public static final String DATA_KEY="data";
    public static final String DATA_STREAM_KEY="dataStream";
    public static final String EXTRA_DATA_KEY="extraData";
    public static final String CONTINUE_DATA_KEY="continueData";
    public static final String INTENT_ACTION="com.portalnesia.action.shareddata";
    public static final String EXTRA_DATA="com.portalnesia.extra.shareddata";

    private final ReactContext reactContext;
    private Promise mPromise;
    private Bundle initialData = null;

    public PNShareModule(ReactApplicationContext context){
        super(context);
        reactContext = context;

        reactContext.addActivityEventListener(new BaseActivityEventListener(){
            @Override
            public void onNewIntent(Intent intent){
                Bundle data = extractShared(intent);
                initialData = data;
                dispatchEvent(data);
            }
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
                if(requestCode==CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE) {
                    if(mPromise!=null) {
                        CropImage.ActivityResult result = CropImage.getActivityResult(data);
                        WritableNativeMap response = new WritableNativeMap();
                        if(resultCode == Activity.RESULT_OK) {
                            Uri resultUri = result.getUri();
                            response.putString("uri",resultUri.toString());
                            mPromise.resolve(response);
                        } else if(resultCode == CropImage.CROP_IMAGE_ACTIVITY_RESULT_ERROR_CODE) {
                            Exception e = result.getError();
                            mPromise.reject(e);
                        } else if(resultCode == Activity.RESULT_CANCELED) {
                            response.putBoolean("cancelled",true);
                            mPromise.resolve(response);
                        }
                        mPromise = null;
                    }
                }
            }
        });
    }

    @Override
    @NonNull
    public String getName(){return REACT_CLASS;}

    @Nullable
    private Bundle extractShared(Intent intent){
        String type = intent.getType();
        if(type==null) {
            return null;
        }
        String action = intent.getAction();
        Bundle data = new Bundle();
        data.putString(MIME_TYPE_KEY,type);
        if(Intent.ACTION_SEND.equals(action) || INTENT_ACTION.equals(action)) {
            if(INTENT_ACTION.equals(action)) {
                data.putString(EXTRA_DATA_KEY,intent.getStringExtra(EXTRA_DATA));
            }
            if("text/plain".equals(type)) {
                data.putString(DATA_KEY,intent.getStringExtra(Intent.EXTRA_TEXT));
                return data;
            }
            if(intent.hasExtra(CONTINUE_DATA_KEY)) {
                data.putString(CONTINUE_DATA_KEY,intent.getStringExtra(CONTINUE_DATA_KEY));
                return data;
            } else {
                Uri fileUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if(fileUri!=null){
                    data.putParcelable(DATA_STREAM_KEY,fileUri);
                    return data;
                }
            }

        }
        return null;
    }

    private String getExt(String type) {
        String ext = "jpg";
        if(type.contains("png") || type.contains("gif")) {
            ext = "png";
        } else if(type.contains("bmp")) {
            ext="bmp";
        }
        return ext;
    }

    private void dispatchEvent(Bundle data){
        if(reactContext==null || !reactContext.hasActiveCatalystInstance()){
            return;
        }
        Promise promise = new Promise() {
            @Override
            public void resolve(@Nullable Object value) {
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(REACT_CLASS,value);
            }

            @Override
            public void reject(String code, String message) {

            }

            @Override
            public void reject(String code, Throwable throwable) {

            }

            @Override
            public void reject(String code, String message, Throwable throwable) {

            }

            @Override
            public void reject(Throwable throwable) {

            }

            @Override
            public void reject(Throwable throwable, WritableMap userInfo) {

            }

            @Override
            public void reject(String code, @NonNull WritableMap userInfo) {

            }

            @Override
            public void reject(String code, Throwable throwable, WritableMap userInfo) {

            }

            @Override
            public void reject(String code, String message, @NonNull WritableMap userInfo) {

            }

            @Override
            public void reject(String code, String message, Throwable throwable, WritableMap userInfo) {

            }

            @Override
            public void reject(String message) {

            }
        };
        handleResult(promise,data);
    }

    @ReactMethod
    public void getSharedData(boolean clearData,Promise promise){
        Activity activity = getCurrentActivity();
        if(activity==null){
            promise.reject("ERROR","Activity doesn't exist");
            return;
        }
        if(initialData != null) {
            Bundle data = initialData;
            if(clearData) {
                clearSharedData();
            }
            handleResult(promise,data);
            return;
        }
        if(!activity.isTaskRoot()){
            Intent newIntent = new Intent(activity.getIntent());
            newIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(newIntent);
            Bundle data = extractShared(newIntent);
            handleResult(promise,data);
            activity.finish();
            return;
        }
        Intent intent = activity.getIntent();
        Bundle data = extractShared(intent);
        if(clearData) {
            clearSharedData();
        }
        handleResult(promise,data);
    }

    private void handleResult(Promise promise,Bundle data) {
        Activity activity = getCurrentActivity();
        if(activity==null){
            promise.reject("ERROR","Activity doesn't exist");
            return;
        }
        if(data==null) {
            promise.resolve(null);
            return;
        }
        String type = data.getString(MIME_TYPE_KEY);
        if("text/plain".equals(type)){
            WritableMap result = Arguments.fromBundle(data);
            promise.resolve(result);
            return;
        }
        String extra = data.getString(EXTRA_DATA_KEY,null);
        String stringData = data.getString(CONTINUE_DATA_KEY,null);
        if(stringData!=null) {
            WritableMap result = new WritableNativeMap();
            result.putString(MIME_TYPE_KEY,type);
            result.putString(DATA_KEY,stringData);
            result.putString(EXTRA_DATA_KEY,extra);
            promise.resolve(result);
            return;
        }
        Uri uri = data.getParcelable(DATA_STREAM_KEY);
        String ext = getExt(type);
        ContentResolver contentResolver = activity.getApplication().getContentResolver();
        ImageExporter exporter = new ImageExporter(contentResolver);
        FileProvider fileProvider = new FileProvider(reactContext.getCacheDir(),ext);
        new ImageResult(promise,uri,fileProvider,exporter,type,extra).execute();
    }

    @ReactMethod
    public void dismiss(){
        Activity activity = getCurrentActivity();
        if(activity == null) {
            return;
        }
        activity.setResult(Activity.RESULT_OK);
        activity.finish();
    }

    private void clearSharedData() {
        initialData = null;
        Activity activity = getCurrentActivity();
        if(activity == null) {
            return;
        }
        Intent intent = activity.getIntent();
        String type = intent.getType();
        if(type==null) {return;}

        if(intent.hasExtra(EXTRA_DATA)) {
            intent.removeExtra(EXTRA_DATA);
        }
        if("text/plain".equals(type)) {
            intent.removeExtra(Intent.EXTRA_TEXT);
        }
        if(intent.hasExtra(Intent.EXTRA_STREAM)) {
            intent.removeExtra(Intent.EXTRA_STREAM);
        }
        if(intent.hasExtra(CONTINUE_DATA_KEY)) {
            intent.removeExtra(CONTINUE_DATA_KEY);
        }
    }

    @ReactMethod
    public void continueInApp(@NonNull String type,@NonNull String data,@Nullable String extraData,Promise promise){
        Activity activity = getCurrentActivity();
        if(activity==null){
            promise.reject("ERROR","Activity doesn't exist");
            return;
        }
        Intent i = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
        i.setAction(INTENT_ACTION);
        i.setType(type);
        if("text/plain".equals(type)) {
            i.putExtra(Intent.EXTRA_TEXT,data);
        } else {
            i.putExtra(CONTINUE_DATA_KEY,data);
        }
        if(extraData!=null) {
            i.putExtra(EXTRA_DATA,extraData);
        }
        promise.resolve(null);
        activity.startActivity(i);
        activity.setResult(Activity.RESULT_OK);
        activity.finish();
    }

    @ReactMethod
    public void startCropActivity(String type,String uri,ReadableMap options, Promise promise) {
        Activity activity = getCurrentActivity();
        if(activity==null){
            promise.reject("ERROR","Activity doesn't exist");
            return;
        }
        int quality = (int)(options.hasKey("quality") ? options.getDouble("quality") : 90);
        Bitmap.CompressFormat compressFormat = Bitmap.CompressFormat.JPEG;
        if (!type.contains("jpeg") && !type.contains("jpg")) {
            compressFormat = Bitmap.CompressFormat.PNG;
        }
        try {
            Uri fileUri = Uri.parse(uri);
            mPromise = promise;
            CropImage.ActivityBuilder activityBuilder = CropImage.activity(fileUri)
                .setOutputCompressQuality(quality)
                .setOutputCompressFormat(compressFormat);

            if(options.hasKey("aspect")) {
                ReadableArray aspect = options.getArray("aspect");
                if(aspect==null) {
                    promise.reject("ERROR","Invalid aspect format!");
                    return;
                }
                int aspectX = aspect.getInt(0);
                int aspectY = aspect.getInt(1);
                activityBuilder
                    .setInitialCropWindowPaddingRatio(0f)
                    .setFixAspectRatio(true)
                    .setAspectRatio(aspectX,aspectY);
            }
            activityBuilder.start(activity);
        } catch (Throwable e){
            promise.reject(e);
        }
    }
}
