package com.dailyplayground;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.telecom.Call;
import android.telecom.DisconnectCause;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.telecom.VideoProfile;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

@RequiresApi(api = Build.VERSION_CODES.O)
public class CallSystem extends ReactContextBaseJavaModule {

    private static final String TAG = CallSystem.class.getName();

    // Static call state that can be accessed anywhere (like ConnectionService)
    public String currentCallRoomUrl;
    public Connection currentConnection;

    @NonNull
    @Override
    public String getName() {
        return "CallSystem";
    }

    // Needed to access state in ConnectionService
    private static CallSystem instance;

    public static CallSystem getInstance() {
        return instance;
    }

    public CallSystem(ReactApplicationContext reactContext) {
        super(reactContext);
        // Assumption: there is only one instance of CallSystem
        instance = this;
    }

    @ReactMethod
    public void askToStartCall(String roomUrl) {
        Log.d(TAG, "askToStartCall: " + roomUrl);
        ReactApplicationContext context = getReactApplicationContext();

        // Prepare extras for placing call
        // CUSTOMIZE HERE
        Bundle extras = new Bundle();
        PhoneAccountHandle phoneAccountHandle = ConnectionService.getPhoneAccountHandle(context);
        extras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, phoneAccountHandle);
        extras.putInt(TelecomManager.EXTRA_START_CALL_WITH_VIDEO_STATE, VideoProfile.STATE_BIDIRECTIONAL);

        // Place call
        TelecomManager telecomManager = (TelecomManager)context.getSystemService(Context.TELECOM_SERVICE);
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.MANAGE_OWN_CALLS) != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "askToStartCall: missing MANAGE_OWN_CALLS permission");
            return;
        }
        telecomManager.placeCall(Uri.parse(roomUrl), extras);

        // Set our current room
        currentCallRoomUrl = roomUrl;
    }

    @ReactMethod
    public void askToEndCall(String roomUrl) {
        Log.d(TAG, "askToEndCall: " + roomUrl);
        if (!roomUrl.equals(currentCallRoomUrl) || currentConnection == null) {
            return;
        }

        Log.d(TAG, "askToEndCall: disconnecting call with cause LOCAL...");
        currentConnection.setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));
        currentConnection.destroy();

        // Tell JS to end call
        sendEndCallEvent();
        clearCallState();
    }

    @ReactMethod
    public void reportCallStarted(String roomUrl) {
        Log.d(TAG, "reportCallStarted: " + roomUrl);
        if (!roomUrl.equals(currentCallRoomUrl) || currentConnection == null) {
            return;
        }

        Log.d(TAG, "reportCallStarted: setting call active...");
        currentConnection.setActive();
    }

    @ReactMethod
    public void reportCallFailed(String roomUrl) {
        Log.d(TAG, "reportCallFailed: " + roomUrl);
        if (!roomUrl.equals(currentCallRoomUrl) || currentConnection == null) {
            return;
        }

        Log.d(TAG, "reportCallFailed: disconnecting call with cause ERROR...");
        currentConnection.setDisconnected(new DisconnectCause(DisconnectCause.ERROR));
    }

    @ReactMethod
    public void reportCallEnded(String roomUrl) {
        Log.d(TAG, "reportCallEnded: " + roomUrl);
        // No-op on Android: disconnection happens in askToEndCall
    }

    public void sendStartCallEvent() {
        Log.d(TAG, "sendStartCallEvent: " + currentCallRoomUrl);
        sendEvent("EventStartCall", getEventPayload());
    }

    public void sendAbortStartingCallEvent() {
        Log.d(TAG, "sendAbortStartingCallEvent: " + currentCallRoomUrl);
        sendEvent("EventAbortStartingCall", getEventPayload());
    }

    public void sendEndCallEvent() {
        Log.d(TAG, "sendEndCallEvent: " + currentCallRoomUrl);
        sendEvent("EventEndCall", getEventPayload());
    }

    void clearCallState() {
        currentCallRoomUrl = null;
        currentConnection = null;
    }

    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private WritableMap getEventPayload() {
        WritableMap payload = Arguments.createMap();
        payload.putString("roomUrl", currentCallRoomUrl);
        return payload;
    }
}
