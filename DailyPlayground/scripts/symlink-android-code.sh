# Note that the current script is meant to be run as an `npm` command under 
# DailyPlayground, hence the path relative to that directory
. ./scripts/variables.sh

RN_DAILY_JS_NODE_MODULES_DIR=./node_modules/@daily-co/react-native-daily-js
RN_WEBRTC_NODE_MODULES_DIR=./node_modules/react-native-webrtc

rm -rf $RN_DAILY_JS_NODE_MODULES_DIR/android && ln -s $RN_DAILY_JS_DIR/android $RN_DAILY_JS_NODE_MODULES_DIR
rm -rf $RN_WEBRTC_NODE_MODULES_DIR/android && ln -s $RN_WEBRTC_DIR/android $RN_WEBRTC_NODE_MODULES_DIR
