# Note that the current script is meant to be run as an `npm` command under 
# DailyPlayground, hence the path relative to that directory
. ./scripts/variables.sh

# `npm pack` react-native-webrtc
pushd $RN_WEBRTC_DIR
rm daily-co-react-native-webrtc-*.tgz
npm pack
popd
