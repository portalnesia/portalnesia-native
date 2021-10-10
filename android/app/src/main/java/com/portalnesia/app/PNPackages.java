package com.portalnesia.app;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.portalnesia.app.authentication.AuthModule;
import com.portalnesia.app.fastimage.PNImageManager;
import com.portalnesia.app.fastimage.PNImageViewModule;
import com.portalnesia.app.sync.SyncModule;
import com.portalnesia.app.authentication.PNGoogleSignInButton;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PNPackages implements ReactPackage {

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext){
        return Arrays.<ViewManager>asList(
            new PNGoogleSignInButton(reactContext),
            new PNImageManager()
        );
    }

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext){
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PNPipModule(reactContext));
        modules.add(new AuthModule(reactContext));
        modules.add(new SyncModule(reactContext));
        modules.add(new PNShareModule(reactContext));
        modules.add(new PNImageViewModule(reactContext));
        return modules;
    }
}
