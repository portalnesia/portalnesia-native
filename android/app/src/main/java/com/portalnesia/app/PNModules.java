package com.portalnesia.app;

import android.app.DownloadManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentSender;
import android.content.pm.PackageInstaller;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.LocaleList;
import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.core.content.FileProvider;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.safetynet.SafetyNet;

import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@ReactModule(name=PNModules.REACT_CLASS)
public class PNModules extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "Portalnesia";
    public static final String ACTION_INSTALL_COMPLETE = "com.portalnesia.app.INSTALL_COMPLETE";

    private ReactApplicationContext reactContext;

    PNModules(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NotNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public Map<String,Object> getConstants(){
        HashMap<String,Object> constants = new HashMap<>();
        constants.put("initialLocalization", getLocalizationConstants());
        constants.put("SUPPORTED_ABIS",getSupportedAbi());
        return constants;
    }

    private final @NonNull BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            ReactApplicationContext reactContext = getReactApplicationContext();
            if(intent.getAction() != null &&
                reactContext.hasActiveCatalystInstance()) {
                reactContext.getJSModule(RCTDeviceEventEmitter.class)
                .emit("localizationChange",getLocalizationConstants());
            }
        }
    };

    @Override
    public void initialize(){
        super.initialize();
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_LOCALE_CHANGED);

        getReactApplicationContext().registerReceiver(mBroadcastReceiver,filter);
    }

    private @NonNull List<Locale> getLocales() {
        List<Locale> locales = new ArrayList<>();
        Configuration config = getReactApplicationContext().getResources().getConfiguration();
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            locales.add(config.locale);
        } else {
            LocaleList list = config.getLocales();
            for (int i = 0; i < list.size(); i++) {
                locales.add(list.get(i));
            }
        }

        return locales;
    }

    private @NonNull String getLanguageCode(@NonNull Locale locale){
        String language = locale.getLanguage();
        switch (language){
            case "iw":
                return "he";
            case "in":
                return "id";
            case "ji":
                return "yi";
        }
        return language;
    }

    private @NonNull String getCountryCode(@NonNull Locale locale){
        try {
            String country = locale.getCountry();
            if(country.equals("419")) {
                return "UN";
            }
            return TextUtils.isEmpty(country) ? "" : country;
        } catch (Exception ignored) {
            return "";
        }
    }

    private @NonNull String getScriptCode(@NonNull Locale locale){
        String script = locale.getScript();
        return TextUtils.isEmpty(script) ? "" : script;
    }

    private @NonNull String getSystemProperty(String key) {
        try {
            Class<?> systemProperties = Class.forName("android.os.SystemProperties");
            Method get = systemProperties.getMethod("get",String.class);
            return (String) Objects.requireNonNull(get.invoke(systemProperties, key));
        } catch (Exception ignored) {
            return "";
        }
    }

    private @NonNull String getRegionCode(@NonNull Locale locale){
        String miuiRegion = getSystemProperty("ro.miui.region");
        if(!TextUtils.isEmpty(miuiRegion)) {
            return miuiRegion;
        }
        return getCountryCode(locale);
    }

    private @NonNull String createLanguageTag(@NonNull String languageCode,
                                       @NonNull String scriptCode,
                                       @NonNull String countryCode) {
        String languageTag = languageCode;
        if(!TextUtils.isEmpty(scriptCode)) {
            languageTag += "-" + scriptCode;
        }
        return languageTag + "-" + countryCode;
    }

    private @NonNull WritableMap getLocalizationConstants() {
        List<Locale> deviceLocales = getLocales();
        Locale currentLocale = deviceLocales.get(0);
        String currentRegionCode = getRegionCode(currentLocale);

        if(TextUtils.isEmpty(currentRegionCode)) {
            currentRegionCode = "US";
        }

        List<String> languageTagsList = new ArrayList<>();
        WritableArray locales = Arguments.createArray();

        for (Locale deviceLocale: deviceLocales) {
            String languageCode = getLanguageCode(deviceLocale);
            String scriptCode = getScriptCode(deviceLocale);
            String countryCode = getCountryCode(deviceLocale);

            if(TextUtils.isEmpty(countryCode)) {
                countryCode = currentRegionCode;
            }

            String languageTag = createLanguageTag(languageCode,scriptCode,countryCode);
            WritableMap locale = Arguments.createMap();
            locale.putString("languageCode",languageCode);
            locale.putString("countryCode",countryCode);
            locale.putString("languageTag",languageTag);

            if(!languageTagsList.contains(languageTag)) {
                languageTagsList.add(languageTag);
                locales.pushMap(locale);
            }
        }

        WritableMap exported = Arguments.createMap();
        exported.putArray("locales",locales);
        exported.putString("country",currentRegionCode);
        return exported;
    }

    public @NonNull WritableArray getSupportedAbi(){
        WritableArray supportedAbis = Arguments.createArray();
        String[] textSupportedAbis = Build.SUPPORTED_ABIS;

        for(String abi: textSupportedAbis) {
            supportedAbis.pushString(abi);
        }
        return supportedAbis;
    }

    private void addApkToInstallSession(File file, PackageInstaller.Session session) throws IOException {
        try (
            OutputStream packageInSession = session.openWrite("PNpackage",0,-1);
            InputStream is = new FileInputStream(file)
        ) {
            byte[] buffer = new byte[16384];
            int n;
            while((n = is.read(buffer)) >= 0) {
                packageInSession.write(buffer,0,n);
            }
        }
    }

    private IntentSender createIntentSender(int sessionId){
        PendingIntent pendingIntent = PendingIntent.getBroadcast(reactContext,sessionId,new Intent(ACTION_INSTALL_COMPLETE),0);
        return pendingIntent.getIntentSender();
    }

    @ReactMethod
    public void installApkSession(String pathname,Promise promise){
        File file = new File(pathname);
        PackageInstaller.Session session = null;
        try {
            PackageInstaller packageInstaller = reactContext.getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            int sessionId = packageInstaller.createSession(params);
            session = packageInstaller.openSession(sessionId);

            addApkToInstallSession(file,session);
            session.commit(createIntentSender(sessionId));
            promise.resolve(true);
        } catch (IOException e) {
            throw new RuntimeException("Couldn't install package",e);
        } catch (RuntimeException e) {
            if(session != null) {
                session.abandon();
            }
            promise.reject(e);
        }
    }

    @ReactMethod
    public void installApkView(String pathname,final Promise promise) {
        try {
            //if(Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
            //    uri = FileProvider.getUriForFile(reactContext,reactContext.getPackageName() + ".fileprovider",file);
            //}

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(getApkUri(pathname),"application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            reactContext.startActivity(intent);

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void installApk(String pathname,final Promise promise) {
        try {
            //if(Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
            //    uri = FileProvider.getUriForFile(reactContext,reactContext.getPackageName() + ".fileprovider",file);
            //}

            Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            intent.setData(getApkUri(pathname));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            reactContext.startActivity(intent);

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private Uri getApkUri(String pathname) {
        File file = new File(pathname);
        Uri uri = Uri.fromFile(file);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            uri = FileProvider.getUriForFile(reactContext, reactContext.getPackageName() + ".fileprovider", file);
        }
        return uri;
    }

    @ReactMethod
    public void isAppInstalled(String packageName, final Promise promise){
        Intent appIntent = reactContext.getPackageManager().getLaunchIntentForPackage(packageName);
        if(appIntent == null) {
            promise.resolve(false);
            return;
        }
        promise.resolve(true);
    }

    @ReactMethod
    public void openDownloadManager() {
        Intent sendIntent = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
        sendIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if(sendIntent.resolveActivity(reactContext.getPackageManager()) != null) {
            reactContext.startActivity(sendIntent);
        }
    }

    @ReactMethod
    public void uriToFileProvider(String pathname,Promise promise){
        try {
            File file = new File(pathname);
            Uri uri = FileProvider.getUriForFile(reactContext, reactContext.getPackageName() + ".fileprovider", file);
            String fileProviderString = uri.toString();
            promise.resolve(fileProviderString);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getAction(Promise promise) {
        Intent intent = Objects.requireNonNull(getCurrentActivity()).getIntent();
        promise.resolve(intent.getAction());
    }

    @ReactMethod
    public void verifyWithRecaptcha(Promise promise) {
        String apiKey = reactContext.getString(R.string.recaptcha_apikey);
        SafetyNet.getClient(reactContext).verifyWithRecaptcha(apiKey)
        .addOnSuccessListener(
                response -> {
                    String token = response.getTokenResult();
                    promise.resolve(token);
                }
        )
        .addOnFailureListener(
            e -> {
                if(e instanceof ApiException) {
                    ApiException apiException = (ApiException) e;
                    int statusCode = apiException.getStatusCode();
                    promise.reject(Integer.toString(statusCode),CommonStatusCodes.getStatusCodeString(statusCode),e);
                } else {
                    promise.reject(e);
                }
            }
        );
    }
}
