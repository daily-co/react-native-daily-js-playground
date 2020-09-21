package com.dailyplayground;

import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.O)
class Connection extends android.telecom.Connection {

    private static final String TAG = Connection.class.getName();

    @Override
    public void onDisconnect() {
        String roomUrl = getAddress().toString();
        Log.d(TAG, "onDisconnect: " + roomUrl);
        CallSystem.getInstance().askToEndCall(roomUrl);
    }
}
