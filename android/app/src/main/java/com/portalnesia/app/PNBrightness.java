package com.portalnesia.app;

import android.app.Activity;
import android.provider.Settings;
import android.view.WindowManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.util.Objects;

@ReactModule(name=PNBrightness.REACT_CLASS)
public class PNBrightness extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNBrightness";

    private ReactApplicationContext reactContext;

    PNBrightness(ReactApplicationContext context) {
        super(context);
        this.reactContext=context;
    }

    @NonNull
    @Override
    public String getName(){ return REACT_CLASS;}

    @ReactMethod
    public void setBrightness(final float brightness) {
        final Activity activity = getCurrentActivity();
        if(activity == null) {
            return;
        }

        activity.runOnUiThread(() -> {
            WindowManager.LayoutParams lp = activity.getWindow().getAttributes();
            lp.screenBrightness = brightness;
            activity.getWindow().setAttributes(lp);
        });
    }

    @ReactMethod
    public void getBrightness(Promise promise){
        WindowManager.LayoutParams lp = Objects.requireNonNull(getCurrentActivity()).getWindow().getAttributes();
        promise.resolve(lp.screenBrightness);
    }

    @ReactMethod
    public void getSystemBrightness(Promise promise){
        String brightness = Settings.System.getString(Objects.requireNonNull(getCurrentActivity()).getContentResolver(),"screen_brightness");
        promise.resolve(Integer.parseInt(brightness)/255f);
    }
}
