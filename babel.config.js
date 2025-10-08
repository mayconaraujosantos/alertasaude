module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
