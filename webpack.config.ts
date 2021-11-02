import path from 'path';
import { EnvironmentPlugin, ProvidePlugin, DefinePlugin, Configuration as WebpackOptions } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Options as TSLoaderOptions } from 'ts-loader';
const tsProvide = require('./ts-provide');

interface ConfigureOptions {
  production?: boolean
  getCustomTransformers?: TSLoaderOptions['getCustomTransformers']
  styleLoader?: string
  plugins?: WebpackOptions['plugins']
}

function configureWebpack(options: ConfigureOptions): WebpackOptions {

  const {
    production = false,
    getCustomTransformers,
    plugins = [],
  } = options;

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        auto: true,
        exportLocalsConvention: 'camelCaseOnly',
      },
    },
  };

  const styleLoader = {
    loader: options.styleLoader,
    options: {
      esModule: false,
    },
  };

  return {
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'source-map',
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
              getCustomTransformers,
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
        title: process.env.APP_NAME,
        filename: 'index-raw.html',
        // scriptLoading: 'blocking',
      }),

      new EnvironmentPlugin(process.env),

      new ProvidePlugin({
        ...tsProvide('./src/imports.d.ts'),
      }),

      // new CopyWebpackPlugin({
      //   patterns: [{ from: 'public' }],
      // }),

      ...plugins,
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

  };
}

export default configureWebpack;
