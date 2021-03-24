module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins:[
      ["module:react-native-dotenv",{
        "moduleName": "@env",
      }],
      ['module-resolver', {
        "alias": {
          "@pn/components": "./components",
          "@pn/utils": "./utils",
          "@pn/screens": "./screens",
          "@pn/assets": "./assets",
          "@pn/provider":"./provider"
        }
      }]
    ]
  };
};
