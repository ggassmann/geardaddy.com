const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackHTMLPlugin = require('html-webpack-plugin')

module.exports = [{
  entry: './src/backend/index.ts',
  mode: 'development',
  devtool: "source-map",
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'node',
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js', '.json', '.tsx', '.xml', '.txt']
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    }, {
      test: /\.(xml|txt)$/,
      use: ["file-loader"],
    }]
  },
  plugins: [
    new CopyPlugin([
      { from: '*', to: 'lua', context: 'src/lua' },
      { from: '*', to: 'include', context: 'bin/' },
    ])
  ]
}, {
  entry: './src/frontend/index.tsx',
  devtool: "source-map",
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/frontend')
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js', '.json', '.tsx', '.xml', '.txt']
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    }, {
      test: /\.(xml|txt)$/,
      use: ["file-loader"],
    }]
  },
  plugins: [
    new WebpackHTMLPlugin(),
  ]
}];