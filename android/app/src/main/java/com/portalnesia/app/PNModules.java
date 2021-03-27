package com.portalnesia.app;

//import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
//import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.os.StatFs;

public class PNModules extends ReactContextBaseJavaModule {
    PNModules(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "Portalnesia";
    }

    @ReactMethod
    public void getFSSize(String path,Promise promise){
        try{
            StatFs stat = new StatFs(path);
            long size = stat.getBlockSizeLong();
            promise.resolve(Long.toString(size));
        } catch (Exception e){
            promise.reject("Failed Get Size",e);
        }
    }

    @ReactMethod
    public void getFSFree(String path,Promise promise){
        try{
            StatFs stat = new StatFs(path);
            long size = stat.getAvailableBytes();
            promise.resolve(Long.toString(size));
        } catch (Exception e){
            promise.reject("Failed Get Size",e);
        }
    }
}
