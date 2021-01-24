const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'eval',
  mode: "development",
  entry: {
    app: "./src/app.js"
  },
  output: {
    path: path.join(__dirname, "/src/bundle"),
    filename: "[name].js",
    publicPath: '/',
    pathinfo: false
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
        use: [{
          loader: 'url-loader',
          options: {
            name: "[name].[ext]",
            outputPath: "./",
          }
        }]
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.jpg']
  },
  devServer: {
    port: 8080
  }
}