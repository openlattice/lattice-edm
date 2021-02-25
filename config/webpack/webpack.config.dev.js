/* eslint-disable import/extensions */

const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATHS = require('../app/paths.config.js');
const baseWebpackConfig = require('./webpack.config.base.js');

module.exports = (env) => {

  const DEV_SERVER_PORT = 9000;
  const baseConfig = baseWebpackConfig(env);

  return {
    ...baseConfig,
    devServer: {
      contentBase: APP_PATHS.ABS.BUILD,
      historyApiFallback: {
        index: baseConfig.output.publicPath,
      },
      hot: true,
      port: DEV_SERVER_PORT,
      publicPath: baseConfig.output.publicPath,
    },
    devtool: false,
    plugins: [
      new HtmlWebpackPlugin({
        favicon: `${APP_PATHS.ABS.SOURCE_ASSETS_IMAGES}/ol-favicon.png`,
        template: `${APP_PATHS.ABS.SOURCE}/index.html`,
      }),
      ...baseConfig.plugins
    ],
  };
};
