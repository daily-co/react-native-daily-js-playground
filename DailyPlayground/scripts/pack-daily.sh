DAILY_JS_DIR=~/src/pluot-core/daily-js
RN_DAILY_JS_DIR=~/src/rn-daily-js-playground/react-native-daily-js

# Metro bundler can't follow symlinks so we can't rely on npm's normal support
# for local packages. That's why we need to consume @daily-co/daily-js and
# @daily-co/react-native-daily-js as packed files.

# `npm pack` @daily-co/daily-js
pushd $DAILY_JS_DIR
npm run build-main # needed because dist/ not built on pack
npm pack
popd

# `npm pack` @daily-co/react-native-daily-js
pushd $RN_DAILY_JS_DIR
npm pack
popd