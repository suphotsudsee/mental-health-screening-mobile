module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          alias: {
            "@screens": "./src/screens",
            "@components": "./src/components",
            "@services": "./src/services",
            "@logic": "./src/logic",
            "@store": "./src/store",
            "@navigation": "./src/navigation",
            "@theme": "./src/theme",
            "@i18n": "./src/i18n"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
