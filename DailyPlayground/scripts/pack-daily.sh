# Note that the current script is meant to be run as an `npm` command under 
# DailyPlayground, hence the path relative to that directory
. ./scripts/variables.sh

# Metro bundler can't follow symlinks so we can't rely on npm's normal support
# for local packages. That's why we need to consume @daily-co/daily-js and
# @daily-co/react-native-daily-js as packed files.

# `npm pack` @daily-co/daily-js
pushd $DAILY_JS_DIR
rm daily-co-daily-js-*.tgz
npm run build-main-dev # needed because dist/ not built on pack alone
npm pack
popd

# `npm pack` @daily-co/react-native-daily-js
pushd $RN_DAILY_JS_DIR
rm daily-co-react-native-daily-js-*.tgz
npm pack
popd
