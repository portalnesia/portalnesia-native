package com.portalnesia.app.authentication;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class AuthenticatorService extends Service {
    private Authenticator auth = null;

    public AuthenticatorService(){
        super();
    }

    @Override
    public void onCreate(){
        super.onCreate();
        if(auth==null) {
            auth = new Authenticator(this);
        }
    }

    @Override
    public IBinder onBind(Intent intent){
        return auth.getIBinder();
    }
}
