package com.portalnesia.app.share;

import android.content.ContentResolver;
import android.net.Uri;

import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ImageExporter implements ImageExportInterface {
    private final ContentResolver contentResolver;

    public ImageExporter(ContentResolver contentResolver) {
        this.contentResolver = contentResolver;
    }

    @Override
    public void export(Uri source, File output, ImageExportListener listener) {
        try {
            copyImage(source,output);
            listener.onResult();
        } catch(IOException e) {
            listener.onFailure(e);
        }
    }

    private void copyImage(Uri originalUri, File file) throws IOException {
        InputStream is = contentResolver.openInputStream(originalUri);
        if(originalUri.compareTo(Uri.fromFile(file)) != 0) {
            FileOutputStream os = new FileOutputStream(file);
            IOUtils.copy(is,os);
        }
    }
}
