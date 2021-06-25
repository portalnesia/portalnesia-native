package com.portalnesia.app.fastimage;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.widget.ImageView;

import com.bumptech.glide.Priority;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.model.Headers;
import com.bumptech.glide.load.model.LazyHeaders;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.signature.ApplicationVersionSignature;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.NoSuchKeyException;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.util.HashMap;
import java.util.Map;

import static com.bumptech.glide.request.RequestOptions.signatureOf;

public class PNImageViewConverter {
    private static final Drawable TRANSPARENT_DRAWABLE = new ColorDrawable(Color.TRANSPARENT);

    private static final Map<String, PNImageCacheControl> FAST_IMAGE_CACHE_CONTROL_MAP =
        new HashMap<String, PNImageCacheControl>() {{
            put("immutable", PNImageCacheControl.IMMUTABLE);
            put("web", PNImageCacheControl.WEB);
            put("cacheOnly", PNImageCacheControl.CACHE_ONLY);
        }};

    private static final Map<String, Priority> FAST_IMAGE_PRIORITY_MAP =
        new HashMap<String, Priority>() {{
            put("low", Priority.LOW);
            put("normal", Priority.NORMAL);
            put("high", Priority.HIGH);
        }};

    private static final Map<String, ImageView.ScaleType> FAST_IMAGE_RESIZE_MODE_MAP =
            new HashMap<String, ImageView.ScaleType>() {{
                put("contain", ImageView.ScaleType.FIT_CENTER);
                put("cover", ImageView.ScaleType.CENTER_CROP);
                put("stretch", ImageView.ScaleType.FIT_XY);
                put("center", ImageView.ScaleType.CENTER_INSIDE);
            }};

    static PNImageSource getImageSource(Context context, ReadableMap source) {
        return new PNImageSource(context, source.getString("uri"), getHeaders(source));
    }

    static Headers getHeaders(ReadableMap source) {
        Headers headers = Headers.DEFAULT;

        if (source.hasKey("headers")) {
            ReadableMap headersMap = source.getMap("headers");
            assert headersMap != null;
            ReadableMapKeySetIterator iterator = headersMap.keySetIterator();
            LazyHeaders.Builder builder = new LazyHeaders.Builder();

            while (iterator.hasNextKey()) {
                String header = iterator.nextKey();
                String value = headersMap.getString(header);

                assert value != null;
                builder.addHeader(header, value);
            }

            headers = builder.build();
        }

        return headers;
    }

    static RequestOptions getOptions(Context context, PNImageSource imageSource, ReadableMap source) {
        // Get priority.
        final Priority priority = PNImageViewConverter.getPriority(source);
        // Get cache control method.
        final PNImageCacheControl cacheControl = PNImageViewConverter.getCacheControl(source);
        DiskCacheStrategy diskCacheStrategy = DiskCacheStrategy.AUTOMATIC;
        boolean onlyFromCache = false;
        boolean skipMemoryCache = false;
        switch (cacheControl) {
            case WEB:
                // If using none then OkHttp integration should be used for caching.
                diskCacheStrategy = DiskCacheStrategy.NONE;
                skipMemoryCache = true;
                break;
            case CACHE_ONLY:
                onlyFromCache = true;
                break;
            case IMMUTABLE:
                // Use defaults.
                break;
        }

        RequestOptions options = new RequestOptions()
                .diskCacheStrategy(diskCacheStrategy)
                .onlyRetrieveFromCache(onlyFromCache)
                .skipMemoryCache(skipMemoryCache)
                .priority(priority)
                .placeholder(TRANSPARENT_DRAWABLE);

        if (imageSource.isResource()) {
            options = options.apply(signatureOf(ApplicationVersionSignature.obtain(context)));
        }

        return options;
    }

    private static PNImageCacheControl getCacheControl(ReadableMap source) {
        return getValueFromSource("cache", "immutable", FAST_IMAGE_CACHE_CONTROL_MAP, source);
    }

    private static Priority getPriority(ReadableMap source) {
        return getValueFromSource("priority", "normal", FAST_IMAGE_PRIORITY_MAP, source);
    }

    static ImageView.ScaleType getScaleType(String propValue) {
        return getValue("resizeMode", "cover", FAST_IMAGE_RESIZE_MODE_MAP, propValue);
    }

    private static <T> T getValue(String propName, String defaultPropValue, Map<String, T> map, String propValue) {
        if (propValue == null) propValue = defaultPropValue;
        T value = map.get(propValue);
        if (value == null)
            throw new JSApplicationIllegalArgumentException("FastImage, invalid " + propName + " : " + propValue);
        return value;
    }

    private static <T> T getValueFromSource(String propName, String defaultProp, Map<String, T> map, ReadableMap source) {
        String propValue;
        try {
            propValue = source != null ? source.getString(propName) : null;
        } catch (NoSuchKeyException e) {
            propValue = null;
        }
        return getValue(propName, defaultProp, map, propValue);
    }


}
