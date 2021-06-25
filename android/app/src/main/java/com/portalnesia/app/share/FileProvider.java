package com.portalnesia.app.share;

import org.unimodules.core.utilities.FileUtilities;

import java.io.File;
import java.io.IOException;

import expo.modules.imagepicker.ImagePickerConstants;

public class FileProvider implements FileProviderInterface {
    private final File cacheFolder;
    private final String extension;

    public FileProvider(File file,String ext) {
        cacheFolder = file;
        extension = ext;
    }

    @Override
    public File generateFile() throws IOException {
        return new File(FileUtilities.generateOutputPath(cacheFolder, ImagePickerConstants.CACHE_DIR_NAME,extension));
    }
}
