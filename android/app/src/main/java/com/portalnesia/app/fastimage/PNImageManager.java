package com.portalnesia.app.fastimage;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.graphics.PorterDuff;
import android.os.Build;
import android.util.TypedValue;
import android.view.View;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.bumptech.glide.Glide;
import com.bumptech.glide.RequestManager;
import com.bumptech.glide.load.model.GlideUrl;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.stfalcon.imageviewer.StfalconImageViewer;
import com.stfalcon.imageviewer.listeners.OnDismissListener;
import com.stfalcon.imageviewer.loader.ImageLoader;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

import static com.portalnesia.app.fastimage.PNImageRequestListener.ON_ERROR_EVENT;
import static com.portalnesia.app.fastimage.PNImageRequestListener.ON_LOAD_END_EVENT;
import static com.portalnesia.app.fastimage.PNImageRequestListener.ON_LOAD_EVENT;

public class PNImageManager extends SimpleViewManager<PNImageView> implements PNImageProgressListener {
    static final String REACT_CLASS="PNImageView";
    static final String ON_LOAD_START_EVENT="onPNImageLoadStart";
    static final String ON_PROGRESS_EVENT="onPNImageProgress";
    static final String ON_DISMISS_EVENT="onPNImageDismiss";
    static final String ON_OPEN_EVENT="onPNImageOpen";

    private static final Map<String, List<ImageView>> VIEWS_FOR_URLS = new WeakHashMap<>();

    @Nullable
    RequestManager requestManager=null;
    private ThemedReactContext reactContext;

    @NonNull
    @Override
    public String getName(){return REACT_CLASS;}

    @NonNull
    @Override
    protected PNImageView createViewInstance(@NonNull ThemedReactContext context){
        reactContext=context;
        if(isValidContextForGlide(context)) {
            requestManager = Glide.with(context);
        }
        return new PNImageView(context);
    }

    @Override
    public float getGranularityPercentage(){return 0.5f;}

    @Override
    public void onProgress(String key, long bytesRead,long expectedLength){
        List<ImageView> viewsForKey = VIEWS_FOR_URLS.get(key);
        if (viewsForKey != null) {
            for (ImageView view : viewsForKey) {
                WritableMap event = new WritableNativeMap();
                event.putInt("loaded", (int) bytesRead);
                event.putInt("total", (int) expectedLength);
                ThemedReactContext context = (ThemedReactContext) view.getContext();
                RCTEventEmitter eventEmitter = context.getJSModule(RCTEventEmitter.class);
                int viewId = view.getId();
                eventEmitter.receiveEvent(viewId, ON_PROGRESS_EVENT, event);
            }
        }
    }

    @Override
    public void onDropViewInstance(@NonNull PNImageView view) {
        // This will cancel existing requests.
        if (requestManager != null) {
            requestManager.clear(view);
        }

        if (view.glideUrl != null) {
            final String key = view.glideUrl.toString();
            PNImageOkHttpProgressGlideModule.forget(key);
            List<ImageView> viewsForKey = VIEWS_FOR_URLS.get(key);
            if (viewsForKey != null) {
                viewsForKey.remove(view);
                if (viewsForKey.size() == 0) VIEWS_FOR_URLS.remove(key);
            }
        }



        super.onDropViewInstance(view);
    }

    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
            .put(ON_LOAD_START_EVENT, MapBuilder.of("registrationName", ON_LOAD_START_EVENT))
            .put(ON_PROGRESS_EVENT, MapBuilder.of("registrationName", ON_PROGRESS_EVENT))
            .put(ON_LOAD_EVENT, MapBuilder.of("registrationName", ON_LOAD_EVENT))
            .put(ON_ERROR_EVENT, MapBuilder.of("registrationName", ON_ERROR_EVENT))
            .put(ON_LOAD_END_EVENT, MapBuilder.of("registrationName", ON_LOAD_END_EVENT))
            .put(ON_DISMISS_EVENT, MapBuilder.of("registrationName", ON_DISMISS_EVENT))
            .put(ON_OPEN_EVENT, MapBuilder.of("registrationName", ON_OPEN_EVENT))
            .build();
    }

    private boolean isNullOrEmpty(final String url) {
        return url == null || url.trim().isEmpty();
    }

    private static boolean isValidContextForGlide(final Context context) {
        Activity activity = getActivityFromContext(context);
        if(activity==null) {
            return false;
        }
        return !isActivityDestroyed(activity);
    }

    private static Activity getActivityFromContext(final Context context) {
        if(context instanceof Activity) {
            return (Activity)context;
        }
        if(context instanceof ThemedReactContext) {
            final Context baseContext = ((ThemedReactContext)context).getBaseContext();
            if(baseContext instanceof Activity) {
                return (Activity)baseContext;
            }
            if(baseContext instanceof ContextWrapper) {
                final ContextWrapper contextWrapper =(ContextWrapper) baseContext;
                final Context wrapperBaseContext = contextWrapper.getBaseContext();
                if(wrapperBaseContext instanceof Activity) {
                    return (Activity)wrapperBaseContext;
                }
            }
        }
        return null;
    }

    private static boolean isActivityDestroyed(Activity activity){
        return activity.isDestroyed() || activity.isFinishing();
    }

    @ReactProp(name = "tintColor", customType = "Color")
    public void setTintColor(PNImageView view, @Nullable Integer color) {
        if (color == null) {
            view.clearColorFilter();
        } else {
            view.setColorFilter(color, PorterDuff.Mode.SRC_IN);
        }
    }

    @ReactProp(name = "resizeMode")
    public void setResizeMode(PNImageView view, String resizeMode) {
        final PNImageView.ScaleType scaleType = PNImageViewConverter.getScaleType(resizeMode);
        view.setScaleType(scaleType);
    }

    @ReactProp(name = "source")
    public void setSrc(PNImageView view, @Nullable ReadableMap source) {
        if (source == null || !source.hasKey("uri") || isNullOrEmpty(source.getString("uri"))) {
            // Cancel existing requests.
            if (requestManager != null) {
                requestManager.clear(view);
            }

            if (view.glideUrl != null) {
                PNImageOkHttpProgressGlideModule.forget(view.glideUrl.toStringUrl());
            }
            // Clear the image.
            view.setImageDrawable(null);
            return;
        }

        final PNImageSource imageSource = PNImageViewConverter.getImageSource(view.getContext(), source);
        final GlideUrl glideUrl = imageSource.getGlideUrl();

        // Cancel existing request.
        view.glideUrl = glideUrl;
        if (requestManager != null) {
            requestManager.clear(view);
        }

        String key = glideUrl.toStringUrl();
        PNImageOkHttpProgressGlideModule.expect(key, this);
        List<ImageView> viewsForKey = VIEWS_FOR_URLS.get(key);
        if (viewsForKey != null && !viewsForKey.contains(view)) {
            viewsForKey.add(view);
        } else if (viewsForKey == null) {
            List<ImageView> newViewsForKeys = new ArrayList<>(Collections.singletonList(view));
            VIEWS_FOR_URLS.put(key, newViewsForKeys);
        }

        ThemedReactContext context = (ThemedReactContext) view.getContext();
        RCTEventEmitter eventEmitter = context.getJSModule(RCTEventEmitter.class);
        int viewId = view.getId();
        eventEmitter.receiveEvent(viewId, ON_LOAD_START_EVENT, new WritableNativeMap());

        if (requestManager != null) {
            requestManager
                // This will make this work for remote and local images. e.g.
                //    - file:///
                //    - content://
                //    - res:/
                //    - android.resource://
                //    - data:image/png;base64
                .load(imageSource.getSourceForLoad())
                .apply(PNImageViewConverter.getOptions(context, imageSource, source))
                .listener(new PNImageRequestListener(key))
                .into(view);
        }
    }

    @SuppressLint("UseCompatLoadingForDrawables")
    @ReactProp(name="dataSrc")
    public void setDataSrc(PNImageView view,@Nullable ReadableMap source) {
        if(source==null || !source.hasKey("uri") || isNullOrEmpty(source.getString("uri"))) {
            view.setClickable(false);
            view.setFocusable(false);
            view.setOnClickListener(null);
        } else {
            OnDismissListener dismissListener = () -> {
                RCTEventEmitter eventEmitter = reactContext.getJSModule(RCTEventEmitter.class);
                int viewId = view.getId();
                eventEmitter.receiveEvent(viewId, ON_DISMISS_EVENT, new WritableNativeMap());
            };

            ImageLoader<ReadableMap> imageLoader = (imageView, image) -> {
                final PNImageSource imageSource = PNImageViewConverter.getImageSource(imageView.getContext(), image);
                if (requestManager != null) {
                    requestManager
                        .load(imageSource.getSourceForLoad())
                        .apply(PNImageViewConverter.getOptions(reactContext, imageSource, image))
                        .into(imageView);
                }
            };

            View.OnClickListener listener = androidView -> {
                List<ReadableMap> images = new ArrayList<>(Collections.singletonList(source));
                RCTEventEmitter eventEmitter = reactContext.getJSModule(RCTEventEmitter.class);
                int viewId = view.getId();
                eventEmitter.receiveEvent(viewId, ON_OPEN_EVENT, new WritableNativeMap());
                new StfalconImageViewer.Builder<>(reactContext, images, imageLoader)
                    .withTransitionFrom(view)
                    .withDismissListener(dismissListener)
                    .allowSwipeToDismiss(true)
                    .allowZooming(true)
                    .show(true);
            };
            view.setFocusable(true);
            view.setClickable(true);
            TypedValue outValue = new TypedValue();
            reactContext.getTheme().resolveAttribute(android.R.attr.selectableItemBackground,outValue,true);
            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                view.setForeground(reactContext.getDrawable(outValue.resourceId));
            } else {
                view.setBackgroundResource(outValue.resourceId);
            }
            view.setOnClickListener(listener);
        }
    }
}
