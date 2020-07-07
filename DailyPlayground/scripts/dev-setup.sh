# Note that the current script is meant to be run as an `npm` command under 
# DailyPlayground, hence the path relative to that directory
. ./scripts/variables.sh

RN_DAILY_JS_VERSION=$(node -e "console.log($(cat $RN_DAILY_JS_DIR/package.json).version);")
DAILY_JS_VERSION=$(node -e "console.log($(cat $DAILY_JS_DIR/package.json).version);")
RN_WEBRTC_VERSION=$(node -e "console.log($(cat $RN_WEBRTC_DIR/package.json).version);")

pushd $PLAYGROUND_DIR
sed -E -i.bak 's|"@daily-co/react-native-daily-js":.*$|"@daily-co/react-native-daily-js": "file:'$RN_DAILY_JS_DIR'/daily-co-react-native-daily-js-'$RN_DAILY_JS_VERSION'.tgz",|' package.json && rm *.bak
sed -E -i.bak 's|"react-native-webrtc":.*$|"react-native-webrtc": "file:'$RN_WEBRTC_DIR'/react-native-webrtc-'$RN_WEBRTC_VERSION'.tgz"|' package.json && rm *.bak
popd

pushd $RN_DAILY_JS_DIR
sed -E -i.bak 's|"@daily-co/daily-js":.*$|"@daily-co/daily-js": "file:'$DAILY_JS_DIR'/daily-co-daily-js-'$DAILY_JS_VERSION'.tgz",|' package.json && rm *.bak
popd
