const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpackConfig = require('../webpack.config');

module.exports = (...args) => {
  const config = webpackConfig(args);
  
  config.plugins.push(new NodePolyfillPlugin());

  return config;
}