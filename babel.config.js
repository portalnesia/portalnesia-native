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
          "@pn/provider":"./provider",
          "@pn/module":"./module",
          "@pn/locale":"./locale",
          "@pn/types":"./types",
          "@pn/navigation":"./navigation"
        }
      }]
    ],
    env:{
      production:{
        plugins:[
          "transform-remove-console"
        ]
      }
    }
  };
};
