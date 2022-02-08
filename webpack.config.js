const path = require('path');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: {
    main: './src/demo/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { plugins: ['react-refresh/babel'] },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            }
          }
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              implementation: require('sass'),
            }
          }
        ]
      }
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/static'),
    publicPath: '/',
  },

  plugins: [
    new ReactRefreshPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebPackPlugin({
      filename: './index.html',
      template: './public/index.html',
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      staticOptions: {},
      publicPath: '/',
    },
    hot: true,
    liveReload: true,
    port: parseInt(process.env.PORT, 10) || 3000,
  },
};