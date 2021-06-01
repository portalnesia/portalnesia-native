package com.portalnesia.app.server;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 *
 */
public class Server {
    public static final String API = "";
    public static final String CLIENT_ID = "";

    private Context ctx;
    private OkHttpClient.Builder builder=null;
    private OkHttpClient client=null;
    private String androidId=null;
    private String androidVersion=null;

    public Server(Context context) {
        ctx = context;
        String packageName = ctx.getPackageName();
        PackageManager packageManager = ctx.getPackageManager();
        try {
            PackageInfo pInfo = packageManager.getPackageInfo(packageName,0);
            androidVersion = pInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {

        }
        androidId = Settings.Secure.getString(ctx.getContentResolver(),Settings.Secure.ANDROID_ID);
        builder = new OkHttpClient.Builder();
        builder.connectTimeout(10, TimeUnit.SECONDS);
        builder.readTimeout(5,TimeUnit.SECONDS);
        builder.writeTimeout(5,TimeUnit.SECONDS);
        client = builder.build();
    }

    @NonNull
    public String refreshToken(Account account) {
        final AccountManager am = AccountManager.get(ctx);
        final String password = am.getPassword(account);
        if(password == null) return "";

        RequestBody body = new FormBody.Builder()
            .add("grant_type","refresh_token")
            .add("refresh_token",password)
            .add("client_id",CLIENT_ID)
            .add("scope","basic,email")
            .add("device_id",androidId)
            .build();

        Request request = new Request.Builder()
            .url(API + "/v2/oauth/token")
            .post(body)
            .build();

        try {
            Response response = client.newCall(request).execute();
            String responseStr = response.body().string();
            JSONObject json = new JSONObject(responseStr);
            String authToken = json.getString("access_token");
            String new_password = json.getString("refresh_token");
            am.setPassword(account,new_password);
            return authToken;
        } catch (IOException e){
            return "";
        } catch (JSONException e){
            return "";
        }
    }

}
