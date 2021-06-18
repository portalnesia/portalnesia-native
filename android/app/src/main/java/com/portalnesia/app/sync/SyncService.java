package com.portalnesia.app.sync;

import android.annotation.SuppressLint;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import javax.annotation.Nullable;

public class SyncService extends Service {
    private static final Object syncLock = new Object();
    @SuppressLint("StaticFieldLeak")
    private static SyncAdapter sync = null;

    @Override
    public void onCreate(){
        super.onCreate();
        synchronized (syncLock) {
            if(sync == null) {
                sync = new SyncAdapter(getApplicationContext(),true);
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return sync.getSyncAdapterBinder();
    }
}
