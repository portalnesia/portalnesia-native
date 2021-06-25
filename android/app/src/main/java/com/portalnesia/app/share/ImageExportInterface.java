package com.portalnesia.app.share;

import android.net.Uri;

import java.io.File;

public interface ImageExportInterface {
    void export(Uri source, File output, ImageExportListener listener);
}
