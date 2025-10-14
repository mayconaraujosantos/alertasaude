module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      'react-native-reanimated/plugin', // deve ser sempre o último plugin
    ],
  };
};
