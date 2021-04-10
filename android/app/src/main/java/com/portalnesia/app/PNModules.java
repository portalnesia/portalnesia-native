package com.portalnesia.app;

//import com.facebook.react.bridge.NativeModule;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.os.Build;
import android.os.LocaleList;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
//import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@ReactModule(name=PNModules.REACT_CLASS)
public class PNModules extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "Portalnesia";

    PNModules(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public Map<String,Object> getConstants(){
        HashMap<String,Object> constants = new HashMap<>();
        constants.put("initialLocalization", getLocalizationConstants());
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
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return "";
        }
        String script = locale.getScript();
        return TextUtils.isEmpty(script) ? "" : script;
    }

    private @NonNull String getSystemProperty(String key) {
        try {
            Class<?> systemProperties = Class.forName("android.os.SystemProperties");
            Method get = systemProperties.getMethod("get",String.class);
            return (String) get.invoke(systemProperties,key);
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
}
