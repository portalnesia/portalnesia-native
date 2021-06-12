package com.portalnesia.app.sync;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.jetbrains.annotations.NotNull;

public class SyncModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNSync";
    private final ReactApplicationContext reactContext;
    public static final String TASK_NAME = "PN_SYNC_TASK";
    public static final boolean ALLOW_FOREGROUND = true;
    public static final long SYNC_TIMEOUT = 300000;
    public static final int DEFAULT_SYNC_INTERVAL = 60*60*6; // 6 hours
    public static final int DEFAULT_SYNC_FLEXTIME = 60*30; // 30 minutes

    public SyncModule(ReactApplicationContext context){
        super(context);
        reactContext = context;
    }

    @NotNull
    @Override
    public String getName() {return REACT_CLASS;}

    @ReactMethod
    public void sync(Promise promise) {
        if(!ALLOW_FOREGROUND && HeadlessSyncService.isAppOnForeground(reactContext)) {
            if(getCurrentActivity() != null) {
                promise.reject("ERROR","This sync task has not been configured to run on the basckground!");
            }
            return;
        }
        SyncAdapter.syncImmediately(reactContext);
        promise.resolve(null);
    }
}
