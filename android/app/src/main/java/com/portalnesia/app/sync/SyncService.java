package com.portalnesia.app.sync;

import android.annotation.SuppressLint;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import javax.annotation.Nullable;

public class SyncService extends Service {
    private static SyncAdapter sync = null;

    public SyncService() {
        super();
    }

    @Override
    public void onCreate(){
        super.onCreate();
        if(sync == null) {
            sync = new SyncAdapter(getApplicationContext(),true);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return sync.getSyncAdapterBinder();
    }
}
