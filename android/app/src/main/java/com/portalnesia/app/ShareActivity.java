package com.portalnesia.app;

import android.content.Intent;
import android.content.res.Configuration;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import org.jetbrains.annotations.NotNull;

public class ShareActivity extends ReactActivity {
    @Override
    public void onConfigurationChanged(@NotNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        sendBroadcast(intent);
    }

    @Override
    protected String getMainComponentName() {
        return "share";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(ShareActivity.this);
            }
        };
    }
}
