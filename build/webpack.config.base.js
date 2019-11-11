const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const { getEntries } = require('./utils.js');

const entries = getEntries('./src/pages/', 'js');

const config = {
  entry: Object.assign(entries, { app: './src/app.js' }),
  output: {
    pathinfo: false,
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[hash:8].js',
    chunkFilename: 'js/[name].chunk.[chunkhash:8].js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src'),
      components: path.resolve(__dirname, '../src/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.twig$/,
        use: ['html-loader', 'twig-html-loader']
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'assets/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              publicPath: '/'
            }
          },
          'svgo-loader'
        ]
      }
    ],
  },
  parallelism: 8,
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
        vendors: {
          chunks: 'initial',
          name: 'vendors',
          test: /node_modules\//,
          minChunks: 5,
          priority: 10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [new SpriteLoaderPlugin()],
};

const pages = getEntries('./src/pages/', 'twig');

for (const pathname in pages) {
  // Configured to generate the html file, define paths, etc.
  const conf = {
    filename: `${pathname}.html`, // html output pathname
    template: path.resolve(__dirname, `.${pages[pathname]}`), // Template path
    inject: true,
    favicon: path.resolve(__dirname, '../src/assets/favicon.ico'),
    chunks: ['commons', 'vendors', 'app', pathname],
    chunksSortMode: 'manual',
  };
  config.plugins.push(new HtmlWebpackPlugin(conf));
}

module.exports = config;
