/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

function isUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  symbolicator: {
    customizeFrame: (frame) => {
      if (frame.file && isUrl(frame.file)) {
        return {
          ...frame,
          // HACK: This prevents Metro from attempting to read the invalid file URL it sent us.
          lineNumber: null,
          column: null,
          // This prevents the invalid frame from being shown by default.
          collapse: true,
        };
      }
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
