package com.portalnesia.app;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.portalnesia.app.authentication.AuthModule;
import com.portalnesia.app.sync.SyncModule;
import com.portalnesia.app.authentication.PNGoogleSignInButton;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PNPackages implements ReactPackage {

    @NotNull
    @Override
    public List<ViewManager> createViewManagers(@NotNull ReactApplicationContext reactContext){
        return Arrays.<ViewManager>asList(
            new PNGoogleSignInButton(reactContext)
        );
    }

    @NotNull
    @Override
    public List<NativeModule> createNativeModules(@NotNull ReactApplicationContext reactContext){
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PNModules(reactContext));
        modules.add(new PNBrightness(reactContext));
        modules.add(new PNPipModule(reactContext));
        modules.add(new AuthModule(reactContext));
        modules.add(new SyncModule(reactContext));
        return modules;
    }
}
