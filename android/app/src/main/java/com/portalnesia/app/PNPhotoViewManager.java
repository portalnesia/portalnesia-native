package com.portalnesia.app;

import androidx.annotation.Nullable;

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class PNPhotoViewManager extends SimpleViewManager<PNPhotoView> {
    public static final String REACT_CLASS = "PNPhotoView";
    public static int COMMAND_SAVE_TWIBBON = 1;

    ReactApplicationContext mCallerContext;
    PNPhotoView mInstance;

    public PNPhotoViewManager(ReactApplicationContext reactContext){
        mCallerContext = reactContext;
    }

    @Override
    public String getName() {return REACT_CLASS;}

    @Override
    public PNPhotoView createViewInstance(ThemedReactContext reactContext){
        mInstance =  new PNPhotoView(reactContext);
        return mInstance;
    }

    @ReactProp(name="src")
    @Nullable
    public void setSrc(PNPhotoView view, String src){
        if(src != null) {
            view.setImage(ImageSource.uri(src));
        }
    }

    @ReactProp(name="orientation")
    public void setOrientation(PNPhotoView view,int orientation){
        view.setOrientation(orientation);
    }

    @ReactProp(name="panLimit")
    public void setPanLimit(PNPhotoView view,int panLimit){
        view.setPanLimit(panLimit);
    }

    @ReactProp(name="minimumScaleType")
    public void setMinimumScaleType(PNPhotoView view,int minimumScaleType){
        view.setMinimumScaleType(minimumScaleType);
    }

    @ReactProp(name="minScale")
    public void setMinScale(PNPhotoView view,int minScale){
        float scaleFloat = (float)minScale;
        view.setMinScale(minScale);
    }

    @ReactProp(name="maxScale")
    public void setMaxScale(PNPhotoView view,int maxScale){
        float scaleFloat = (float)maxScale;
        view.setMaxScale(scaleFloat);
    }

    @ReactProp(name="doubleTapZoomScale")
    public void setDoubleTapZoomScale(PNPhotoView view,int doubleTapZoomScale){
        float scaleFloat = (float)doubleTapZoomScale;
        view.setDoubleTapZoomScale(scaleFloat);
    }

    @ReactProp(name="doubleTapZoomStyle")
    public void setDoubleTapZoomStyle(PNPhotoView view, int doubleTapZoomStyle){
        view.setDoubleTapZoomStyle(doubleTapZoomStyle);
    }

    @ReactProp(name="doubleTapZoomDuration")
    public void setDoubleTapZoomDuration(PNPhotoView view,int duration){
        view.setDoubleTapZoomDuration(duration);
    }

    @ReactProp(name="panEnabled")
    public void setPanEnabled(PNPhotoView view,boolean enable){
        view.setPanEnabled(enable);
    }

    @ReactProp(name="zoomEnabled")
    public void setZoomEnabled(PNPhotoView view,boolean enable){
        view.setZoomEnabled(enable);
    }

    @ReactProp(name="quickScaleEnabled")
    public void setQuickScaleEnabled(PNPhotoView view,boolean enable){
        view.setQuickScaleEnabled(enable);
    }

    @ReactProp(name="debug")
    public void setDebug(PNPhotoView view,boolean debug){
        view.setDebug(debug);
    }

    @Override
    public Map getExportedCustomBubblingEventTypeConstants(){
        return MapBuilder.builder()
            .put(
                "photoReady",
                    MapBuilder.of("phasedRegistrationNames",MapBuilder.of("bubbled","onReady"))
            ).build();
    }
}
