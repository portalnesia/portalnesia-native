package com.portalnesia.app.fastimage;

import android.app.Activity;

import com.bumptech.glide.Glide;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import org.jetbrains.annotations.NotNull;

public class PNImageViewModule extends ReactContextBaseJavaModule {
    static final String REACT_CLASS = "PNImageView";

    public PNImageViewModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NotNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void preload(final ReadableArray sources) {
        final Activity activity = getCurrentActivity();
        if (activity == null) return;
        activity.runOnUiThread(() -> {
            for (int i = 0; i < sources.size(); i++) {
                final ReadableMap source = sources.getMap(i);
                assert source != null;
                final PNImageSource imageSource = PNImageViewConverter.getImageSource(activity, source);

                Glide
                    .with(activity.getApplicationContext())
                    // This will make this work for remote and local images. e.g.
                    //    - file:///
                    //    - content://
                    //    - res:/
                    //    - android.resource://
                    //    - data:image/png;base64
                    .load(
                            imageSource.isBase64Resource() ? imageSource.getSource() :
                                    imageSource.isResource() ? String.valueOf(imageSource.getUri()) : String.valueOf(imageSource.getGlideUrl())
                    )
                    .apply(PNImageViewConverter.getOptions(activity, imageSource, source))
                    .preload();
            }
        });
    }
}
