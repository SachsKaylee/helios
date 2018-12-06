require('dotenv').config();
const path = require('path');
const glob = require('glob');
const nextOffline = require('next-offline');

console.log("NODE_ENV", process.env.NODE_ENV);

module.exports = nextOffline({

  // Service Worker
  dontAutoRegisterSw: true,
  generateSw: false,
  //devSwSrc: path.join(__dirname, "./.build/service-worker.js"),
  workboxOpts: {
    swDest: "../sw/service-worker.js",
    swSrc: path.join(__dirname, "./src/service-worker/index.js"),
    importWorkboxFrom: "local",
    //globPatterns: ['static/**/*'],
    //globDirectory: '.',
    // TODO: I just copied these. Read up on these settings.
    // https://github.com/PatrickSachs/next-offline/blob/master/index.js
    //runtimeCaching: [{ urlPattern: /^https?.*/, handler: 'networkFirst' }],
  },

  // Next JS,
  distDir: "../.build/next",
  dir: path.join(__dirname, "./src"),

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
