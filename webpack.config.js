const path = require('path');
const { EnvironmentPlugin, ProvidePlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
});
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const tsProvide = require('./ts-provide');
const ssrMiddleware = require('./ssrMiddleware');

module.exports = _env => {
  const dev = !process.argv.includes('--mode=production');

  const env = {
    port: 3000,
    ...dotenv.parsed,
    ..._env,
  };

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        auto: true,
        exportLocalsConvention: 'camelCaseOnly',
      },
    },
  };

  const styleLoader = dev
    ? {
      loader: MiniCssExtractPlugin.loader,
      options: {
        esModule: false,
      },
    }
    : {
      loader: 'style-loader',
      options: {
        esModule: false,
      },
    };

  return {
    mode: dev ? 'development' : 'production',
    devtool: 'source-map',
    target: 'web',

    entry: './src/index.tsx',

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: path.resolve(__dirname, './src'),
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: dev ? [ReactRefreshTypeScript()] : [],
              }),
            },
          },
        },

        {
          test: /\.css$/,
          use: [styleLoader, cssLoader],
        },

        {
          test: /\.scss$/,
          use: [styleLoader, cssLoader, 'sass-loader'],
        },

        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          type: 'asset',
        },
      ],
    },

    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        path: require.resolve('path-browserify')
      },
    },

    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        title: env.APP_NAME,
      }),

      new MiniCssExtractPlugin(),

      new EnvironmentPlugin(env),

      new ProvidePlugin({
        ...tsProvide('./src/imports.d.ts'),
      }),

      // new DefinePlugin({}),

      // new CopyWebpackPlugin({
      //   patterns: [{ from: 'public' }],
      // }),

      ...[dev && new ReactRefreshWebpackPlugin()].filter(Boolean),
    ],

    optimization: {
      chunkIds: 'named',
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    devServer: {
      port: env.port,
      host: env.host,
      historyApiFallback: true,
      client: {
        progress: true,
      },
      hot: true,
      onBeforeSetupMiddleware: ({ app }) => {
        app.use((...args) => ssrMiddleware(env, ...args));
      },
      // static: {
      //   publicPath: '/',
      // },
      // proxy: {
      //   '/api': {
      //     target: env.API_HOST,
      //   },
      // },
    },
  };
};
