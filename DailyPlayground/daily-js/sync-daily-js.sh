DAILY_JS_SRC_DIR=~/src/pluot-core/daily-js
DAILY_JS_DEST_DIR=~/src/rn-daily-js-playground/DailyPlayground/daily-js

# Build daily-js
cd $DAILY_JS_SRC_DIR
npm run build-main

# Copy daily-js
cp $DAILY_JS_SRC_DIR/dist/daily-iframe.js $DAILY_JS_DEST_DIR
