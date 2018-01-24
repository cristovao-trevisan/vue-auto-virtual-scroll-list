const webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: {
    app: './src/index',
  },
  output: {
    path: __dirname,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
        }],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],
  devServer: {
    contentBase: __dirname,
  },
}
