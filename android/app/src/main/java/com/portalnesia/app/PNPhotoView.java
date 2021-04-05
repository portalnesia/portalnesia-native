package com.portalnesia.app;

import android.content.Context;

import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class PNPhotoView extends SubsamplingScaleImageView {
    public PNPhotoView(Context context){
        super(context);
    }

    @Override
    public void onReady(){
        super.onReady();
        WritableMap event = Arguments.createMap();
        event.putBoolean("ready",true);
        ReactContext reactContext = (ReactContext)getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
            getId(),
            "photoReady",
            event
        );
    }
}
