package com.portalnesia.app.authentication;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.android.gms.common.SignInButton;

public class PNGoogleSignInButton extends SimpleViewManager<SignInButton> {
    private ReactApplicationContext ctx;

    public PNGoogleSignInButton(ReactApplicationContext context){
        ctx=context;
    }

    @NonNull
    @Override
    public String getName() {return "PNGoogleSignInButton";}

    @NonNull
    @Override
    protected SignInButton createViewInstance(@NonNull final ThemedReactContext reactContext) {
        SignInButton button = new SignInButton(reactContext);
        button.setSize(SignInButton.SIZE_STANDARD);
        button.setColorScheme(SignInButton.COLOR_AUTO);
        button.setOnClickListener(view -> reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("PNGoogleSignInButtonClicked",null));
        return button;
    }

    @ReactProp(name="size")
    public void setSize(SignInButton button,int size){
        button.setSize(size);
    }

    @ReactProp(name="color")
    public void setColor(SignInButton button,int color){
        button.setColorScheme(color);
    }

    @ReactProp(name="disabled")
    public void setDisabled(SignInButton button,boolean disabled){
        button.setEnabled(!disabled);
    }
}
