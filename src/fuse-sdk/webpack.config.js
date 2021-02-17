const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  /* createConfig('commonjs2'), */
  createConfig('commonjs2', 'node'),
  createConfig('window')
];

function createConfig(libraryTarget, target) {
  var config = {
    resolve: {
      fallback: {
        "os": require.resolve("os-browserify/browser"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify")
      }
    },
    entry: ["regenerator-runtime/runtime", "./src/index.js"],
    output: {
      path: __dirname,
      filename: "./dist/fuse." + (target !== undefined ? target + "." : "") + libraryTarget + ".js",
      libraryTarget: libraryTarget,
      libraryExport: 'default',
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false
            }
          }
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "entry",
                    corejs: { version: 3 }
                  }
                ]
              ],
              plugins: ["@babel/plugin-proposal-class-properties"]
            }
          }
        }
      ]
    }
  };

  if (libraryTarget === "window") config.output.library = "Fuse";
  if (target !== undefined) config.target = target;

  if (target === "node") {
    config.plugins = [
      new webpack.DefinePlugin({
        btoa: function (string) {
          return process.browser ? btoa(string) : Buffer.from(string, 'binary').toString('base64');
        }
      }),
      new webpack.ProvidePlugin({
        window: 'global/window',
      }),
      new webpack.ProvidePlugin({
        electron: "electron"
      })
    ];
  } else {
    config.plugins = [
      new webpack.ProvidePlugin({
        process: target === "node" ? "process" : "process/browser"
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      })
    ];
  }

  return config;
}
