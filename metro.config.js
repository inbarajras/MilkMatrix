const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver config to handle Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  'stream': require.resolve('readable-stream'),
  'buffer': require.resolve('buffer'),
  'crypto': require.resolve('expo-crypto'),
  'http': false,
  'https': false,
  'os': false,
  'url': false,
  'assert': false,
  'fs': false,
  'path': false,
  'util': false,
  'events': require.resolve('events'),
  // Block WebSocket and realtime packages
  'ws': false,
  '@supabase/realtime-js': path.resolve(__dirname, 'src/utils/mockRealtime.js'),
};

// Add resolver config to exclude problematic packages
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Block problematic modules at the resolver level
config.resolver.blockList = [
  /node_modules\/ws\/.*/,
];

module.exports = config;
