const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: '',
  mode: "development",
  entry: {
    main: "./src/assets/native.js"
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js",
    publicPath: 'dist/',
    pathinfo: false
  },
  optimization: {
    namedModules: false,
    namedChunks: false,
    nodeEnv: 'production',
    flagIncludedChunks: true,
    occurrenceOrder: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    splitChunks: {
      hidePathInfo: true,
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
    },
    noEmitOnErrors: true,
    checkWasmTypes: true,
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /.s[ac]ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(eot|gif|svg|ttf|woff|woff2|jpg)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    // new CompressionPlugin({
    //   cache: true
    // }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.jpg']
  },
  devServer: {
    inline: true,
    port: 10000
  }
}