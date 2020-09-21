package com.dailyplayground;

import android.content.ComponentName;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.telecom.ConnectionRequest;
import android.telecom.PhoneAccount;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;

import androidx.annotation.RequiresApi;

import static android.telecom.TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE;
import static android.telecom.TelecomManager.PRESENTATION_UNKNOWN;

@RequiresApi(api = Build.VERSION_CODES.O)
public class ConnectionService extends android.telecom.ConnectionService {

    private static final String TAG = ConnectionService.class.getName();

    @Override
    public void onCreateOutgoingConnectionFailed(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        String roomUrl = request.getAddress().toString();
        Log.d(TAG, "onCreateOutgoingConnectionFailed: " + roomUrl);
        CallSystem.getInstance().sendAbortStartingCallEvent();
        CallSystem.getInstance().clearCallState();
    }

    @Override
    public android.telecom.Connection onCreateOutgoingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        String roomUrl = request.getAddress().toString();
        Log.d(TAG, "onCreateOutgoingConnection: " + roomUrl);

        // CUSTOMIZE HERE
        Connection connection = new Connection();
        connection.setConnectionProperties(android.telecom.Connection.PROPERTY_SELF_MANAGED);
        connection.setVideoState(request.getVideoState());
        connection.setAudioModeIsVoip(true);
        connection.setAddress(request.getAddress(), PRESENTATION_UNKNOWN);

        Bundle extras = new Bundle();
        extras.putParcelable(EXTRA_PHONE_ACCOUNT_HANDLE, request.getAccountHandle());
        connection.putExtras(extras);

        // Start tracking ongoing connection, and tell JS to start the call
        CallSystem callSystem = CallSystem.getInstance();
        callSystem.currentConnection = connection;
        callSystem.sendStartCallEvent();

        return connection;
    }

    static PhoneAccountHandle getPhoneAccountHandle(Context context) {
        ComponentName componentName = new ComponentName(context, ConnectionService.class);
        PhoneAccountHandle phoneAccountHandle = new PhoneAccountHandle(componentName, "DailyPlaygroundPhoneAccount");

        Bundle extras = new Bundle();
        extras.putBoolean(PhoneAccount.EXTRA_LOG_SELF_MANAGED_CALLS, true);

        PhoneAccount.Builder builder =
                PhoneAccount.builder(phoneAccountHandle, "My DailyPlayground User")
                        .setCapabilities(PhoneAccount.CAPABILITY_SELF_MANAGED |
                                PhoneAccount.CAPABILITY_VIDEO_CALLING |
                                PhoneAccount.CAPABILITY_SUPPORTS_VIDEO_CALLING)
                        .setExtras(extras);
        PhoneAccount account = builder.build();

        TelecomManager telecomManager = context.getSystemService(TelecomManager.class);
        telecomManager.registerPhoneAccount(account);

        return phoneAccountHandle;
    }
}
