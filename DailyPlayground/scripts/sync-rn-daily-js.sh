DAILY_JS_DIR=~/src/pluot-core/daily-js
RN_DAILY_JS_DIR=~/src/rn-daily-js-playground/react-native-daily-js
PLAYGROUND_DIR=~/src/rn-daily-js-playground/DailyPlayground

# Metro bundler can't follow symlinks so we can't rely on npm's normal support
# for local packages. Instead, we need to:

# 1. `npm pack` @daily-co/daily-js
pushd $DAILY_JS_DIR
npm pack
popd

# 2. `npm pack` @daily-co/react-native-daily-js
pushd $RN_DAILY_JS_DIR
npm pack
popd

# 3. `npm install` @daily-co/react-native-daily-js as a dependency of this playground
pushd $PLAYGROUND_DIR
npm i @daily-co/react-native-daily-js --force
popd
