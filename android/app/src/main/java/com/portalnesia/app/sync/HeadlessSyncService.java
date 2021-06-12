package com.portalnesia.app.sync;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import java.util.List;

public class HeadlessSyncService extends HeadlessJsTaskService {
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        if(SyncModule.ALLOW_FOREGROUND || !isAppOnForeground(this)) {
            Bundle extras = intent.getExtras();
            WritableMap data = extras != null ? Arguments.fromBundle(extras) : Arguments.createMap();
            return new HeadlessJsTaskConfig(
                SyncModule.TASK_NAME,
                data,
                SyncModule.SYNC_TIMEOUT,
                SyncModule.ALLOW_FOREGROUND
            );
        }
        stopSelf();
        return null;
    }

    public static boolean isAppOnForeground(Context context) {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        assert activityManager != null;
        List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();

        if(appProcesses == null) {
            return false;
        }
        final String packageName = context.getPackageName();
        for(ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if(appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                && appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }
}
