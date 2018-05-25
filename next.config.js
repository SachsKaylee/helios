require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

console.log("NODE_ENV", process.env.NODE_ENV);

module.exports = {
  webpack: (config, { dev }) => {
    // Setup SASS
    config.module.rules.push(
      {
        test: /\.(css|scss)/,
        loader: 'emit-file-loader',
        options: {
          name: 'dist/[path][name].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader']
      },
      {
        test: /\.s(a|c)ss$/,
        use: [
          'babel-loader',
          'raw-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['styles', 'node_modules']
                .map(d => path.join(__dirname, d))
                .map(g => glob.sync(g))
                .reduce((a, c) => a.concat(c), [])
            }
          }
        ]
      }
    );

    // Setup environment variables
    config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    config.plugins.push(new UglifyJsPlugin());

    return config;
  }
};