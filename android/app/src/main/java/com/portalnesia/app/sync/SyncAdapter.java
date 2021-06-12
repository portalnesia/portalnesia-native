package com.portalnesia.app.sync;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.AbstractThreadedSyncAdapter;
import android.content.ContentProviderClient;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SyncRequest;
import android.content.SyncResult;
import android.os.Bundle;

import com.portalnesia.app.R;

public class SyncAdapter extends AbstractThreadedSyncAdapter {

    private final Context ctx;

    public SyncAdapter(Context context, boolean autoInit) {
        super(context,autoInit);
        ctx = context;
    }

    @Override
    public void onPerformSync(Account account, Bundle bundle, String s, ContentProviderClient contentProviderClient, SyncResult syncResult) {
        Intent service = new Intent(ctx,HeadlessSyncService.class);
        ctx.startService(service);
    }

    public static void syncImmediately(Context context) {
        String type = context.getResources().getString(R.string.account_type);
        AccountManager am = (AccountManager) context.getSystemService(Context.ACCOUNT_SERVICE);
        Account[] account_list = am.getAccountsByType(type);

        if(account_list.length==0) {
            return;
        }
        Account account = account_list[0];
        String authority = context.getResources().getString(R.string.sync_provider);

        Bundle bundle = new Bundle();
        bundle.putBoolean(ContentResolver.SYNC_EXTRAS_EXPEDITED,true);
        bundle.putBoolean(ContentResolver.SYNC_EXTRAS_MANUAL,true);
        ContentResolver.requestSync(account,authority,bundle);
    }

    public static void configurePeriodicSync(Context context, Account account, int interval, int flexTime) {
        String authority = context.getResources().getString(R.string.sync_provider);
        SyncRequest syncRequest = new SyncRequest.Builder()
            .syncPeriodic(interval,flexTime)
            .setSyncAdapter(account,authority)
            .setExtras(new Bundle()).build();
        ContentResolver.requestSync(syncRequest);
    }
}
