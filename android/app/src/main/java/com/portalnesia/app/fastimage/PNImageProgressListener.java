package com.portalnesia.app.fastimage;

public interface PNImageProgressListener {
    void onProgress(String key,long bytesRead,long expectedLength);
    float getGranularityPercentage();
}
