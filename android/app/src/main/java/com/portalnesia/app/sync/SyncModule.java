package com.portalnesia.app.sync;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SyncModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNSync";
    private final ReactApplicationContext reactContext;
    public static final String TASK_NAME = "PN_SYNC_TASK";
    public static final boolean ALLOW_FOREGROUND = true;
    public static final long SYNC_TIMEOUT = 300000;
    public static final int DEFAULT_SYNC_INTERVAL = 60*60*12; // 24 hours
    public static final int DEFAULT_SYNC_FLEXTIME = 60*30; // 30 minutes

    public SyncModule(ReactApplicationContext context){
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {return REACT_CLASS;}

    @ReactMethod
    public void sync(Promise promise) {
        if(!ALLOW_FOREGROUND && HeadlessSyncService.isAppOnForeground(reactContext)) {
            if(getCurrentActivity() != null) {
                promise.reject("ERROR","This sync task has not been configured to run on the background!");
            }
            return;
        }
        if(!HeadlessSyncService.isNetworkAvailable(reactContext)) {
            promise.reject("ERROR","Network unavailable!");
            return;
        }
        SyncAdapter.syncImmediately(reactContext);
        promise.resolve(null);
    }
}
