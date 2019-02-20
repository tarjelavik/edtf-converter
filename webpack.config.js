const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin
    = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const exec = require('child_process').exec;

module.exports = {
  mode: 'production',
  output: {
    filename: 'edtf-converter.min.js',
    // https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    library: 'edtfConverter',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {test: /\.ts$/, loader: 'ts-loader'},
    ],
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
    }),
    // Prevent Moment.js from imorting all locales
    new MomentLocalesPlugin({
      localesToKeep: ['en'],
    }),
    // Clean unwanted declaration files after build
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec(
            `find ./dist/types/ -type f -not -name 'index.d.ts' -print0 | xargs -0 rm --`,
            (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            }
          );
        });
      }
    }
  ],
};
