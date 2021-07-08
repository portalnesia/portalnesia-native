package com.portalnesia.app.fastimage;

import android.graphics.drawable.Drawable;

import androidx.annotation.Nullable;

import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.target.ImageViewTarget;
import com.bumptech.glide.request.target.Target;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class PNImageRequestListener implements RequestListener<Drawable> {
    static final String ON_ERROR_EVENT = "onPNImageError";
    static final String ON_LOAD_EVENT = "onPNImageLoad";
    static final String ON_LOAD_END_EVENT = "onPNImageLoadEnd";

    private String key;

    public PNImageRequestListener(String key) {
        this.key = key;
    }

    private static WritableMap mapFromResource(Drawable resource) {
        WritableMap resourceData = new WritableNativeMap();
        resourceData.putInt("width", resource.getIntrinsicWidth());
        resourceData.putInt("height", resource.getIntrinsicHeight());
        return resourceData;
    }

    @Override
    public boolean onLoadFailed(@Nullable GlideException e, Object model, Target<Drawable> target, boolean isFirstResource) {
        PNImageOkHttpProgressGlideModule.forget(key);
        if (!(target instanceof ImageViewTarget)) {
            return false;
        }
        PNImageView view = (PNImageView) ((ImageViewTarget) target).getView();
        ThemedReactContext context = (ThemedReactContext) view.getContext();
        RCTEventEmitter eventEmitter = context.getJSModule(RCTEventEmitter.class);
        int viewId = view.getId();
        eventEmitter.receiveEvent(viewId, ON_ERROR_EVENT, new WritableNativeMap());
        eventEmitter.receiveEvent(viewId, ON_LOAD_END_EVENT, new WritableNativeMap());
        return false;
    }

    @Override
    public boolean onResourceReady(Drawable resource, Object model, Target<Drawable> target, DataSource dataSource, boolean isFirstResource) {
        if (!(target instanceof ImageViewTarget)) {
            return false;
        }
        PNImageView view = (PNImageView) ((ImageViewTarget) target).getView();
        ThemedReactContext context = (ThemedReactContext) view.getContext();
        RCTEventEmitter eventEmitter = context.getJSModule(RCTEventEmitter.class);
        int viewId = view.getId();
        eventEmitter.receiveEvent(viewId, ON_LOAD_EVENT, mapFromResource(resource));
        eventEmitter.receiveEvent(viewId, ON_LOAD_END_EVENT, new WritableNativeMap());
        return false;
    }
}
