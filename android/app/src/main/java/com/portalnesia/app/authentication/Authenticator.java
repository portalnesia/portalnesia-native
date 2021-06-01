package com.portalnesia.app.authentication;

import android.accounts.AbstractAccountAuthenticator;
import android.accounts.Account;
import android.accounts.AccountAuthenticatorResponse;
import android.accounts.AccountManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.portalnesia.app.AuthActivity;

public class Authenticator extends AbstractAccountAuthenticator {
    private final Context ctx;

    public Authenticator(Context context){
        super(context);
        ctx = context;
    }

    @Override
    public Bundle editProperties(AccountAuthenticatorResponse accountAuthenticatorResponse, String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Bundle addAccount(AccountAuthenticatorResponse accountAuthenticatorResponse, String s, String s1, String[] strings, Bundle bundle) {
        Bundle reply = new Bundle();
        Intent intent = new Intent(ctx, AuthActivity.class);
        intent.putExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE,accountAuthenticatorResponse);
        intent.putExtra(AccountManager.KEY_ACCOUNT_TYPE,s);
        intent.putExtra(AuthModule.ADD_ACCOUNT,true);
        intent.putExtra(AuthModule.RESTART_APP,false);
        reply.putParcelable(AccountManager.KEY_INTENT,intent);
        return reply;
    }

    @Override
    public Bundle confirmCredentials(AccountAuthenticatorResponse accountAuthenticatorResponse, Account account, Bundle bundle) {
        return null;
    }

    @Override
    public Bundle getAuthToken(AccountAuthenticatorResponse accountAuthenticatorResponse, Account account, String s, Bundle bundle) {
        /*final AccountManager am = AccountManager.get(ctx);
        //String authToken = am.peekAuthToken(account,AuthModule.ACCOUNT_TYPE);

        if(TextUtils.isEmpty(authToken)) {
            Server server = new Server(ctx);
            authToken = server.refreshToken(account);
        }

        if(!TextUtils.isEmpty(authToken)) {
            final Bundle result = new Bundle();
            result.putString(AccountManager.KEY_AUTHTOKEN,authToken);
            result.putString(AccountManager.KEY_ACCOUNT_NAME,account.name);
            result.putString(AccountManager.KEY_ACCOUNT_TYPE,account.type);
            return result;
        }

        final Intent intent = new Intent(ctx,AuthActivity.class);
        intent.putExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE,accountAuthenticatorResponse);
        intent.putExtra(AccountManager.KEY_ACCOUNT_NAME,account.name);
        intent.putExtra(AccountManager.KEY_ACCOUNT_TYPE,account.type);
        intent.putExtra(AuthModule.RESTART_APP,false);
        intent.putExtra(AuthModule.ADD_ACCOUNT,false);
        final Bundle bundle1 = new Bundle();
        bundle1.putParcelable(AccountManager.KEY_INTENT,intent);
        return bundle1;*/
        return null;
    }

    @Override
    public String getAuthTokenLabel(String s) {
        return null;
    }

    @Override
    public Bundle updateCredentials(AccountAuthenticatorResponse accountAuthenticatorResponse, Account account, String s, Bundle bundle) {
        return null;
    }

    @Override
    public Bundle hasFeatures(AccountAuthenticatorResponse accountAuthenticatorResponse, Account account, String[] strings) {
        final Bundle result = new Bundle();
        result.putBoolean(AccountManager.KEY_BOOLEAN_RESULT,false);
        return result;
    }
}
