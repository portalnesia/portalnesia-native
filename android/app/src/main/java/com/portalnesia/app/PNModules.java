package com.portalnesia.app;

//import com.facebook.react.bridge.NativeModule;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;
import com.facebook.react.bridge.ReactApplicationContext;
//import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.HashMap;
import java.util.Map;

public class PNModules extends ReactContextBaseJavaModule {
    PNModules(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "Portalnesia";
    }

    @Override
    public Map<String,Object> getConstants(){
        final Map<String,Object> constants = new HashMap<>();
        constants.put("PhotoView_ORIENTATION_0", SubsamplingScaleImageView.ORIENTATION_0);
        constants.put("PhotoView_ORIENTATION_90", SubsamplingScaleImageView.ORIENTATION_90);
        constants.put("PhotoView_ORIENTATION_180", SubsamplingScaleImageView.ORIENTATION_180);
        constants.put("PhotoView_ORIENTATION_270", SubsamplingScaleImageView.ORIENTATION_270);
        constants.put("PhotoView_ORIENTATION_USE_EXIF", SubsamplingScaleImageView.ORIENTATION_USE_EXIF);
        constants.put("PhotoView_ZOOM_FOCUS_FIXED", SubsamplingScaleImageView.ZOOM_FOCUS_FIXED);
        constants.put("PhotoView_ZOOM_FOCUS_CENTER", SubsamplingScaleImageView.ZOOM_FOCUS_CENTER);
        constants.put("PhotoView_ZOOM_FOCUS_CENTER_IMMEDIATE", SubsamplingScaleImageView.ZOOM_FOCUS_CENTER_IMMEDIATE);
        constants.put("PhotoView_PAN_LIMIT_INSIDE", SubsamplingScaleImageView.PAN_LIMIT_INSIDE);
        constants.put("PhotoView_PAN_LIMIT_CENTER", SubsamplingScaleImageView.PAN_LIMIT_CENTER);
        constants.put("PhotoView_PAN_LIMIT_OUTSIDE", SubsamplingScaleImageView.PAN_LIMIT_OUTSIDE);
        constants.put("PhotoView_SCALE_TYPE_CENTER_INSIDE", SubsamplingScaleImageView.SCALE_TYPE_CENTER_INSIDE);
        constants.put("PhotoView_SCALE_TYPE_CENTER_CROP", SubsamplingScaleImageView.SCALE_TYPE_CENTER_CROP);
        constants.put("PhotoView_SCALE_TYPE_CUSTOM", SubsamplingScaleImageView.SCALE_TYPE_CUSTOM);
        return constants;
    }
}
