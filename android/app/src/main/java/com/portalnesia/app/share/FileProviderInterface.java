package com.portalnesia.app.share;

import java.io.File;
import java.io.IOException;

public interface FileProviderInterface {
    File generateFile() throws IOException;
}
