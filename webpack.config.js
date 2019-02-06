const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin
    = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    filename: 'edtf-parser.min.js',
    // https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    libraryTarget: 'umd',
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
    }),
    // Prevent Moment.js from imorting all locales
    new MomentLocalesPlugin({
      localesToKeep: ['en'],
    }),
  ],
};
