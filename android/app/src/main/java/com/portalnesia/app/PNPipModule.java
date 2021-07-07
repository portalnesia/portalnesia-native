package com.portalnesia.app;

import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.Objects;

public class PNPipModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;
    public static final String REACT_CLASS = "PNpip";

    public PNPipModule(ReactApplicationContext context) {
        super(context);
        reactContext=context;
    }

    @NonNull
    @Override
    public String getName(){return REACT_CLASS;}

    @RequiresApi(api = Build.VERSION_CODES.N)
    @ReactMethod
    public void isAvailable(Promise promise) {
        Boolean result = reactContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE);
        promise.resolve(result);
    }

    @ReactMethod
    public void enterPictureInPicture(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            promise.resolve(new WritableNativeMap());
            Objects.requireNonNull(getCurrentActivity()).enterPictureInPictureMode();
        } else {
            promise.reject("ERROR","Unsupported");
        }
    }
}
