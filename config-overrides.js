const webpack = require('webpack');

module.exports = function override(config, env) {
  // Polyfill configurations
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "stream": require.resolve("stream-browserify"),
    "process/browser": require.resolve("process/browser.js"),
    "crypto": require.resolve("crypto-browserify"),
    "vm": require.resolve("vm-browserify")
  });
  config.resolve.fallback = fallback;
  
  // Plugins configuration
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ]);
  
  // Source map handling
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: 'pre',
    use: {
      loader: require.resolve('source-map-loader'),
    },
  });

  // Enhanced devServer configuration (only in development)
  if (env === 'development') {
    config.devServer = {
      ...config.devServer, // Preserve existing devServer config
      allowedHosts: ['localhost'],
 // Added pattern matching
      historyApiFallback: true,
      hot: true,
      open: true,
      client: {
        overlay: {
          warnings: false,
          errors: true
        }
      }
    };
  }

  return config;
};