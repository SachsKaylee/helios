require('dotenv').config();
const path = require('path');
const glob = require('glob');
const nextOffline = require('next-offline');

const isDevelopment = process.env.NODE_ENV !== "production";
console.log("NODE_ENV", process.env.NODE_ENV, isDevelopment);

module.exports = nextOffline({

  // Service Worker
  dontAutoRegisterSw: true,
  generateSw: false,
  generateInDevMode: true,
  //devSwSrc: path.join(__dirname, "./.build/service-worker.js"),
  workboxOpts: {
    swDest: "./service-worker.js",
    swSrc: path.join(__dirname, "./service-worker/index.js"),
    importWorkboxFrom: "local",
    globPatterns: ['static/**/*'],
    globDirectory: '.'
  },

  // Next JS,
  dev: isDevelopment,
  //distDir: "./.build",
  //dir: path.join(__dirname, "./src"),

  // Webpack
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
        use: ['raw-loader', /*'postcss-loader'*/]
      },
      {
        test: /\.s(a|c)ss$/,
        use: [
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
    //config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    /*if (process.env.NODE_ENV === "production") {
      config.plugins.push(new UglifyJsPlugin());
    }*/

    return config;
  }

});
