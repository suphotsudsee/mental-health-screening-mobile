const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: 9104
};

module.exports = config;
