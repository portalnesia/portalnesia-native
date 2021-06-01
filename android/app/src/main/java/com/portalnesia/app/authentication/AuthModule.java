package com.portalnesia.app.authentication;

import android.accounts.Account;
import android.accounts.AccountAuthenticatorResponse;
import android.accounts.AccountManager;
import android.accounts.AccountManagerFuture;
import android.accounts.AuthenticatorException;
import android.accounts.OperationCanceledException;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.android.gms.common.SignInButton;
import com.portalnesia.app.AuthActivity;
import com.portalnesia.app.R;

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

    private ReactApplicationContext reactContext;
    AccountManager manager = null;
    Integer accumulator = 0;
    HashMap<Integer,Account> accounts = new HashMap<>();

    public AuthModule(ReactApplicationContext context) {
        super(context);
        reactContext=context;
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
        manager = AccountManager.get(reactContext);
        Account[] account_list = manager.getAccountsByType(type);
        WritableNativeArray result = new WritableNativeArray();

        for(Account account: account_list) {
            Integer index = indexForAccount(account);

            WritableNativeMap account_object = new WritableNativeMap();
            account_object.putInt("index",(int)index);
            account_object.putString("name",account.name);
            account_object.putString("type",account.type);
            result.pushMap(account_object);
        }
        promise.resolve(result);
    }

    @ReactMethod
    public void addAccountExplicitly(String userName, String password,Promise promise) {
        String type = reactContext.getResources().getString(R.string.account_type);
        manager = AccountManager.get(reactContext);
        Account account = new Account(userName,type);
        Integer index = indexForAccount(account);
        Bundle userdata = new Bundle();

        try {
            if(!manager.addAccountExplicitly(account, password, userdata)) {
                promise.reject("ERROR","Account with username already exists!");
                return;
            }

            WritableNativeMap result = new WritableNativeMap();
            result.putInt("index",(int)index);
            result.putString("name",account.name);
            result.putString("type",account.type);

            promise.resolve(result);
        } catch (SecurityException e){
            promise.reject("ERROR",e.getLocalizedMessage(),e);
        }
    }

    @ReactMethod
    public void removeAccount(ReadableMap accountObject,Promise promise){
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        manager = AccountManager.get(reactContext);
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
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Objects.requireNonNull(getCurrentActivity()).startActivity(intent);
    }

    @ReactMethod
    public void getIntentExtra(Promise promise){
        Intent intent = Objects.requireNonNull(getCurrentActivity()).getIntent();
        boolean restart = intent.getBooleanExtra(AuthModule.RESTART_APP,true);
        WritableNativeMap result = new WritableNativeMap();
        result.putString("name",intent.getStringExtra(AccountManager.KEY_ACCOUNT_NAME));
        result.putString("type",intent.getStringExtra(AccountManager.KEY_ACCOUNT_TYPE));
        result.putBoolean("restart",restart);
        promise.resolve(result);
    }

    @ReactMethod
    public void restartApps() {
        Intent i = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        Objects.requireNonNull(getCurrentActivity()).startActivity(i);
    }

    @ReactMethod
    public void addAccount(String userName,String password,String authToken,boolean restart) {
        String type = reactContext.getResources().getString(R.string.account_type);
        manager = AccountManager.get(reactContext);
        final Activity activity = getCurrentActivity();
        assert activity != null;
        final Intent intent = activity.getIntent();
        final AccountAuthenticatorResponse response = intent.getParcelableExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE);
        if(response != null) {
            if(userName != null) {
                final Bundle result = new Bundle();
                result.putString(AccountManager.KEY_ACCOUNT_NAME,userName);
                result.putString(AccountManager.KEY_ACCOUNT_TYPE,type);
                result.putString(ACCOUNT_PASSWORD,password);
                result.putString(AccountManager.KEY_AUTHTOKEN,authToken);
                response.onResult(result);
            } else {
                response.onError(AccountManager.ERROR_CODE_CANCELED,"Canceled");
            }
        }
        final Account account = new Account(userName,type);
        manager.addAccountExplicitly(account,password,null);
        manager.setAuthToken(account,type,authToken);
        if(restart) {
            Intent i = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            activity.startActivity(i);
        } else {
            activity.setResult(Activity.RESULT_OK);
            activity.finish();
        }
    }
}
