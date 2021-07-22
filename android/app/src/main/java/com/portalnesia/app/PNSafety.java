package com.portalnesia.app;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.safetynet.SafetyNet;

import io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsNativeHelper;

public class PNSafety extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNSafety";

    private final ReactApplicationContext reactContext;

    PNSafety(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void isGooglePlayServicesAvailable(Promise promise) {
        if(GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactContext) == ConnectionResult.SUCCESS) {
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void getVerification(String nonceStr, Promise promise) {
        String apiKey = reactContext.getString(R.string.verification_apikey);
        byte[] nonce = nonceStr.getBytes();
        SafetyNet.getClient(reactContext).attest(nonce,apiKey)
        .addOnSuccessListener(
                response -> {
                    String result = response.getJwsResult();
                    promise.resolve(result);
                }
        )
        .addOnFailureListener(
                e -> {
                    ReactNativeFirebaseCrashlyticsNativeHelper.recordNativeException(e);
                    if(e instanceof ApiException) {
                        ApiException apiException = (ApiException) e;
                        int statusCode = apiException.getStatusCode();
                        promise.reject(Integer.toString(statusCode), CommonStatusCodes.getStatusCodeString(statusCode),e);
                    } else {
                        promise.reject(e);
                    }
                }
        );
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
                        promise.reject(Integer.toString(statusCode), CommonStatusCodes.getStatusCodeString(statusCode),e);
                    } else {
                        promise.reject(e);
                    }
                }
        );
    }
}
