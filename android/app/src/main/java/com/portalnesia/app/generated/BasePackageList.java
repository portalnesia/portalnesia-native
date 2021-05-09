package com.portalnesia.app.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new expo.modules.application.ApplicationPackage(),
        new expo.modules.av.AVPackage(),
        new expo.modules.cellular.CellularPackage(),
        new expo.modules.constants.ConstantsPackage(),
        new expo.modules.crypto.CryptoPackage(),
        new expo.modules.device.DevicePackage(),
        new expo.modules.documentpicker.DocumentPickerPackage(),
        new expo.modules.filesystem.FileSystemPackage(),
        new expo.modules.font.FontLoaderPackage(),
        new expo.modules.imagepicker.ImagePickerPackage(),
        new expo.modules.intentlauncher.IntentLauncherPackage(),
        new expo.modules.localauthentication.LocalAuthenticationPackage(),
        new expo.modules.location.LocationPackage(),
        new expo.modules.medialibrary.MediaLibraryPackage(),
        new expo.modules.notifications.NotificationsPackage(),
        new expo.modules.permissions.PermissionsPackage(),
        new expo.modules.securestore.SecureStorePackage(),
        new expo.modules.splashscreen.SplashScreenPackage(),
        new expo.modules.updates.UpdatesPackage(),
        new expo.modules.webbrowser.WebBrowserPackage(),
        new expo.modules.imageloader.ImageLoaderPackage()
    );
  }
}
