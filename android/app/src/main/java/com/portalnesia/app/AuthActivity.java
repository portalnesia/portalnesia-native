package com.portalnesia.app;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.portalnesia.app.authentication.AuthModule;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class AuthActivity extends ReactActivity {
    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        sendBroadcast(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String type = getResources().getString(R.string.account_type);
        if(getIntent().getBooleanExtra(AuthModule.ADD_ACCOUNT,true)) {
            Context ctx = getApplicationContext();
            AccountManager manager = AccountManager.get(ctx);
            Account[] account_list = manager.getAccountsByType(type);
            if(account_list.length > 0) {
                Toast.makeText(this,"Portalnesia account is added already",Toast.LENGTH_LONG).show();
                setResult(Activity.RESULT_OK);
                finish();
            }
        }
    }

    @Override
    protected String getMainComponentName() {
        return "auth";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(AuthActivity.this);
            }
        };
    }
}
