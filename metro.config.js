const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

module.exports = defaultConfig;