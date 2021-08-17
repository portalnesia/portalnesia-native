package com.portalnesia.app;

import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;

public class PNNotification extends ReactContextBaseJavaModule {
    public static String REACT_CLASS = "PNNotification";

    private final ReactApplicationContext reactContext;

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public PNNotification(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public Map<String,Object> getConstants(){
        HashMap<String,Object> constants = new HashMap<>();
        constants.put("PRIORITY_DEFAULT", NotificationCompat.PRIORITY_DEFAULT);
        constants.put("PRIORITY_HIGH", NotificationCompat.PRIORITY_HIGH);
        constants.put("PRIORITY_LOW", NotificationCompat.PRIORITY_LOW);
        constants.put("PRIORITY_MAX", NotificationCompat.PRIORITY_MAX);
        constants.put("PRIORITY_MIN", NotificationCompat.PRIORITY_MIN);
        constants.put("VISIBILITY_PRIVATE", NotificationCompat.VISIBILITY_PRIVATE);
        constants.put("VISIBILITY_PUBLIC", NotificationCompat.VISIBILITY_PUBLIC);
        constants.put("VISIBILITY_SECRET", NotificationCompat.VISIBILITY_SECRET);
        return constants;
    }

    @ReactMethod
    public void notify(int notification_id, String channel_id, ReadableMap options, Promise promise) {
        final String packageName = reactContext.getPackageName();
        NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext,channel_id);
        builder.setSmallIcon(R.mipmap.ic_launcher);

        Intent openApp = reactContext.getPackageManager().getLaunchIntentForPackage(packageName);
        if(openApp == null) {
            openApp = new Intent();
            openApp.setPackage(packageName);
            openApp.addCategory(Intent.CATEGORY_LAUNCHER);
        }
        openApp.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if(options.hasKey("uri")) {
            openApp.setAction(Intent.ACTION_VIEW);
            openApp.setData(Uri.parse(options.getString("uri")));
        }
        builder.setContentIntent(PendingIntent.getActivity(reactContext,0,openApp,PendingIntent.FLAG_CANCEL_CURRENT));

        if(options.hasKey("title")) {
            builder.setContentTitle(options.getString("title"));
        }

        if(options.hasKey("body")) {
            builder.setContentText(options.getString("body"));
        }

        if(options.hasKey("progress")) {
            ReadableMap progress = options.getMap("progress");
            if(progress == null || !progress.hasKey("progress") || !progress.hasKey("max") || !progress.hasKey("intermediate")) {
                promise.reject("ERR","Progress input invalid!");
                return;
            }
            builder.setProgress(progress.getInt("max"),progress.getInt("progress"),progress.getBoolean("intermediate"));
        }

        if(options.hasKey("autoCancel")) {
            builder.setAutoCancel(options.getBoolean("autoCancel"));
        }

        if(options.hasKey("onGoing")) {
            builder.setOngoing(options.getBoolean("onGoing"));
        }

        if(options.hasKey("silent")) {
            builder.setSilent(options.getBoolean("silent"));
        }

        if(options.hasKey("priority")) {
            builder.setPriority(options.getInt("priority"));
        }

        if(options.hasKey("visibility")) {
            builder.setVisibility(options.getInt("visibility"));
        }

        NotificationManagerCompat manager = NotificationManagerCompat.from(reactContext);
        manager.notify(notification_id,builder.build());
        promise.resolve(null);
    }

    @ReactMethod
    public void cancel(int notification_id) {
        NotificationManagerCompat manager = NotificationManagerCompat.from(reactContext);
        manager.cancel(notification_id);
    }

    @ReactMethod
    public void cancelAll() {
        NotificationManagerCompat manager = NotificationManagerCompat.from(reactContext);
        manager.cancelAll();
    }
}
