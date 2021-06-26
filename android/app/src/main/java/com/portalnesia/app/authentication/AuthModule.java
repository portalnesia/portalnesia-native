package com.portalnesia.app.authentication;

import android.accounts.Account;
import android.accounts.AccountAuthenticatorResponse;
import android.accounts.AccountManager;
import android.accounts.AccountManagerFuture;
import android.accounts.AuthenticatorException;
import android.accounts.OperationCanceledException;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.os.Build;
import android.os.Bundle;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.android.gms.auth.api.identity.BeginSignInRequest;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.auth.api.identity.SignInClient;
import com.google.android.gms.auth.api.identity.SignInCredential;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.portalnesia.app.AuthActivity;
import com.portalnesia.app.R;
import com.portalnesia.app.sync.SyncAdapter;
import com.portalnesia.app.sync.SyncModule;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class AuthModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "PNauth";
    public static final String ACCOUNT_PASSWORD = "password";
    public static final String ADD_ACCOUNT = "addaccount";
    public static final String RESTART_APP = "restartapp";
    public static final int REQ_ONE_TAP = 1;

    private final ReactApplicationContext reactContext;
    final AccountManager manager;
    Integer accumulator = 0;
    HashMap<Integer,Account> accounts = new HashMap<>();
    private Promise mOneTapPromise;
    private final SignInClient oneTapClient;
    private final BeginSignInRequest signInRequest;

    public AuthModule(ReactApplicationContext context) {
        super(context);
        reactContext=context;
        manager = (AccountManager)context.getSystemService(Context.ACCOUNT_SERVICE);

        oneTapClient = Identity.getSignInClient(context);
        signInRequest = BeginSignInRequest.builder()
            .setPasswordRequestOptions(BeginSignInRequest.PasswordRequestOptions.builder()
            .setSupported(true)
            .build())
            .build();

        ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
                if (requestCode == REQ_ONE_TAP) {
                    if (mOneTapPromise != null) {
                        try {
                            SignInCredential credential = oneTapClient.getSignInCredentialFromIntent(intent);
                            String username = credential.getId();
                            String password = credential.getPassword();
                            if (password != null) {
                                WritableNativeMap result = new WritableNativeMap();
                                result.putString("email", username);
                                result.putString("password", password);
                                mOneTapPromise.resolve(result);
                            }
                        } catch (ApiException e) {
                            switch (e.getStatusCode()) {
                                case CommonStatusCodes.CANCELED:
                                    mOneTapPromise.reject("CANCELED", "Request canceled", e);
                                    break;
                                case CommonStatusCodes.NETWORK_ERROR:
                                    mOneTapPromise.reject("ERROR", "Network error", e);
                                    break;
                                default:
                                    mOneTapPromise.reject("ERROR", "Something went wrong", e);
                                    break;
                            }
                        }
                        mOneTapPromise = null;
                    }
                }
            }
        };
        context.addActivityEventListener(mActivityEventListener);
    }

    @NotNull
    @Override
    public String getName() {return REACT_CLASS;}

    @Override
    public Map<String,Object> getConstants() {
        final Map<String,Object> constants = new HashMap<>();
        constants.put("BUTTON_SIZE_ICON", SignInButton.SIZE_ICON_ONLY);
        constants.put("BUTTON_SIZE_STANDARD",SignInButton.SIZE_STANDARD);
        constants.put("BUTTON_SIZE_WIDE",SignInButton.SIZE_WIDE);
        constants.put("BUTTON_COLOR_AUTO",SignInButton.COLOR_AUTO);
        constants.put("BUTTON_COLOR_LIGHT",SignInButton.COLOR_LIGHT);
        constants.put("BUTTON_COLOR_DARK",SignInButton.COLOR_DARK);
        return constants;
    }

    private Integer indexForAccount(Account account) {
        for(Map.Entry<Integer,Account> e: accounts.entrySet()) {
            if(e.getValue().equals(account)) {
                return e.getKey();
            }
        }

        accounts.put(accumulator,account);
        return accumulator++;
    }

    @ReactMethod
    public void getAccounts(Promise promise) {
        String type = reactContext.getResources().getString(R.string.account_type);
        Account[] account_list = manager.getAccountsByType(type);
        WritableNativeArray result = new WritableNativeArray();

        for(Account account: account_list) {
            Integer index = indexForAccount(account);

            WritableNativeMap account_object = new WritableNativeMap();
            account_object.putInt("index", index);
            account_object.putString("name",account.name);
            account_object.putString("type",account.type);
            result.pushMap(account_object);
        }
        promise.resolve(result);
    }

    @ReactMethod
    public void addAccountExplicitly(String userName, String password,Promise promise) {
        String type = reactContext.getResources().getString(R.string.account_type);
        Account account = new Account(userName,type);
        Integer index = indexForAccount(account);
        Bundle userdata = new Bundle();

        try {
            if(!manager.addAccountExplicitly(account, password, userdata)) {
                promise.reject("ERROR","Account with username already exists!");
                return;
            }

            WritableNativeMap result = new WritableNativeMap();
            result.putInt("index", index);
            result.putString("name",account.name);
            result.putString("type",account.type);

            promise.resolve(result);
        } catch (SecurityException e){
            promise.reject("ERROR",e.getLocalizedMessage(),e);
        }
    }

    @ReactMethod
    public void removeAccount(ReadableMap accountObject,Promise promise){
        int index = accountObject.getInt("index");
        Account account = accounts.get(index);

        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            if (manager.removeAccountExplicitly(account)) {
                accounts.remove(index);
                promise.resolve(null);
            } else {
                promise.reject("ERROR","Failed to remove account");
            }
        } else {
            AccountManagerFuture<Boolean> future = manager.removeAccount(account,null,null);
            try {
                if(future.getResult()) {
                    accounts.remove(index);
                    promise.resolve(null);
                } else {
                    promise.reject("ERROR","Failed to remove account");
                }
            } catch (OperationCanceledException e){
                promise.reject("ERROR","Operation canceled: " + e.getLocalizedMessage(),e);
            } catch (AuthenticatorException e){
                promise.reject("ERROR","Authenticator error: " + e.getLocalizedMessage(),e);
            } catch (IOException e){
                promise.reject("ERROR","IO error: " + e.getLocalizedMessage(),e);
            }
        }
    }

    @ReactMethod
    public void renameAccount(ReadableMap accountObject,String newName,Promise promise) {
        int index = accountObject.getInt("index");
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }
        AccountManagerFuture<Account> future = manager.renameAccount(account,newName,null,null);

        try {
            Account newAccount = future.getResult();
            accounts.remove(index);
            accounts.put(index,newAccount);
            promise.resolve(null);
        } catch (OperationCanceledException e){
            promise.reject("ERROR","Operation canceled: " + e.getLocalizedMessage(),e);
        } catch (AuthenticatorException e){
            promise.reject("ERROR","Authenticator error: " + e.getLocalizedMessage(),e);
        } catch (IOException e){
            promise.reject("ERROR","IO error: " + e.getLocalizedMessage(),e);
        }
    }

    /*@ReactMethod
    public void getAuthToken(ReadableMap accountObject,Promise promise) {
        String type = reactContext.getResources().getString(R.string.account_type);
        manager = AccountManager.get(reactContext);
        int index = accountObject.getInt("index");
        Account account = accounts.get(accountObject.getInt("index"));
        AccountManagerFuture<Bundle> future = manager.getAuthToken(account,type,null,true,null,null);

        try {
            String authToken = future.getResult().getString(AccountManager.KEY_AUTHTOKEN);
            promise.resolve(authToken);
        } catch (OperationCanceledException e){
            promise.reject("ERROR","Operation canceled: " + e.getLocalizedMessage(),e);
        } catch (AuthenticatorException e){
            promise.reject("ERROR","Authenticator error: " + e.getLocalizedMessage(),e);
        } catch (IOException e){
            promise.reject("ERROR","IO error: " + e.getLocalizedMessage(),e);
        }
    }*/

    @ReactMethod
    public void setUserData(ReadableMap accountObject,String key,String data,Promise promise){
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }
        manager.setUserData(account,key,data);
        promise.resolve(null);
    }

    @ReactMethod
    public void getUserData(ReadableMap accountObject,String key,Promise promise) {
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }

        WritableNativeMap result = new WritableNativeMap();
        result.putString("value",manager.getUserData(account,key));
        promise.resolve(result);
    }

    @ReactMethod
    public void getPassword(ReadableMap accountObject,Promise promise){
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }
        String password = manager.getPassword(account);
        promise.resolve(password);
    }

    @ReactMethod
    public void setPassword(ReadableMap accountObject,String password,Promise promise){
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }
        manager.setPassword(account,password);
        promise.resolve(null);
    }

    @ReactMethod
    public void setAuthToken(ReadableMap accountObject,String authToken,Promise promise) {
        String type = reactContext.getResources().getString(R.string.account_type);
        Account account = accounts.get(accountObject.getInt("index"));
        if(account==null) {
            promise.reject("ERROR","Invalid account");
            return;
        }
        manager.setAuthToken(account,type,authToken);
        promise.resolve(null);
    }

    @ReactMethod
    public void startAuthActivity() {
        final Intent intent = new Intent(reactContext, AuthActivity.class);
        intent.putExtra(AuthModule.RESTART_APP,true);
        intent.putExtra(AuthModule.ADD_ACCOUNT,true);
        Objects.requireNonNull(getCurrentActivity()).startActivity(intent);
    }

    @ReactMethod
    public void getIntentExtra(Promise promise){
        final WritableNativeMap result = new WritableNativeMap();
        try {
            Intent intent = Objects.requireNonNull(getCurrentActivity()).getIntent();
            boolean restart = intent.getBooleanExtra(AuthModule.RESTART_APP,true);
            result.putString("name",intent.getStringExtra(AccountManager.KEY_ACCOUNT_NAME));
            result.putString("type",intent.getStringExtra(AccountManager.KEY_ACCOUNT_TYPE));
            result.putBoolean("restart",restart);
        } catch (NullPointerException e) {
            result.putString("name",null);
            result.putString("type",null);
            result.putBoolean("restart",true);
        }
        promise.resolve(result);
    }

    @ReactMethod
    public void restartApps() {
        Intent i = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        Objects.requireNonNull(getCurrentActivity()).startActivity(i);
    }

    @ReactMethod
    public void addAccount(String userName,String password,String authToken) {
        String type = reactContext.getResources().getString(R.string.account_type);
        final Activity activity = getCurrentActivity();
        assert activity != null;
        final Intent intent = activity.getIntent();
        final AccountAuthenticatorResponse response = intent.getParcelableExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE);
        if(userName != null) {
            final Account account = new Account(userName,type);
            manager.addAccountExplicitly(account,password,null);
            manager.setAuthToken(account,type,authToken);
            if(response != null) {
                final Bundle result = new Bundle();
                result.putString(AccountManager.KEY_ACCOUNT_NAME,userName);
                result.putString(AccountManager.KEY_ACCOUNT_TYPE,type);
                result.putString(ACCOUNT_PASSWORD,password);
                result.putString(AccountManager.KEY_AUTHTOKEN,authToken);
                response.onResult(result);
            }
            String authority = reactContext.getResources().getString(R.string.sync_provider);
            SyncAdapter.configurePeriodicSync(getReactApplicationContext(),account, SyncModule.DEFAULT_SYNC_INTERVAL,SyncModule.DEFAULT_SYNC_FLEXTIME);
            ContentResolver.setSyncAutomatically(account,authority,true);
        } else {
            if(response != null) response.onError(AccountManager.ERROR_CODE_CANCELED,"Canceled");
        }
        Intent i = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        activity.startActivity(i);
    }

    @ReactMethod
    public void prompOneTapSignIn(Promise promise){
        Activity activity = getCurrentActivity();
        if(activity==null){
            promise.reject("ERROR","Activity doesn't exist");
            return;
        }
        mOneTapPromise = promise;
        oneTapClient.beginSignIn(signInRequest)
            .addOnSuccessListener(result -> {
                try {
                    activity.startIntentSenderForResult(
                        result.getPendingIntent().getIntentSender(),REQ_ONE_TAP,null,0,0,0
                    );
                } catch (IntentSender.SendIntentException e) {
                    promise.reject("ERROR","Couldn't start One Tap UI",e);
                }
            })
            .addOnFailureListener(e -> promise.reject("NO_CREDENTIALS","No saved credentials",e));
    }

    @ReactMethod
    public void oneTapSignOut(Promise promise) {
        oneTapClient.signOut();
        promise.resolve(null);
    }
}
