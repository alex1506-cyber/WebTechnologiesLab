const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    blacklistRE: /node_modules\/.*\/node_modules\/.*/,
  },
  watchFolders: [__dirname], // Add additional directories to be watched
};
