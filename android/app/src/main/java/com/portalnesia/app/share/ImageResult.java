package com.portalnesia.app.share;

import android.net.Uri;
import android.os.AsyncTask;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableNativeMap;
import com.portalnesia.app.PNShareModule;

import java.io.File;
import java.io.IOException;

public class ImageResult extends AsyncTask<Void,Void,Void> {
    private final Promise mPromise;
    private final Uri mUri;
    private final FileProvider mProvider;
    private final ImageExporter mExporter;
    private final String mType;
    private final String mExtra;

    public ImageResult(Promise promise,Uri uri,FileProvider fileProvider,ImageExporter imageExporter,String type, @Nullable String extra) {
        mPromise=promise;
        mUri=uri;
        mExporter = imageExporter;
        mProvider = fileProvider;
        mType = type;
        mExtra = extra;
    }

    @Override
    protected Void doInBackground(Void... voids) {
        try {
            File output = mProvider.generateFile();
            ImageExportListener handler = new ImageExportListener() {
                @Override
                public void onResult() {
                    WritableNativeMap result = new WritableNativeMap();
                    result.putString(PNShareModule.DATA_KEY,Uri.fromFile(output).toString());
                    result.putString(PNShareModule.MIME_TYPE_KEY,mType);
                    if(mExtra != null) {
                        result.putString(PNShareModule.EXTRA_DATA_KEY,mExtra);
                    }
                    mPromise.resolve(result);
                }

                @Override
                public void onFailure(Throwable cause) {
                    mPromise.reject(cause);
                }
            };
            mExporter.export(mUri,output,handler);
        } catch (IOException e) {
            mPromise.reject(e);
        }
        return null;
    }
}
