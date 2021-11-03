import path from 'path';
import { EnvironmentPlugin, ProvidePlugin, DefinePlugin, Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
const tsProvide = require('./ts-provide');

const isDevelopmentMode = process.env.NODE_ENV !== 'production';

const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      auto: true,
      exportLocalsConvention: 'camelCaseOnly',
    },
  },
};

const styleLoader = isDevelopmentMode
  ? {
    loader: MiniCssExtractPlugin.loader,
    options: {
      esModule: false,
    },
  } : {
    loader: 'style-loader',
    options: {
      esModule: false,
    },
  };

const getCustomTransformers = () => ({
  before: [ReactRefreshTypeScript()],
});

const developmentPlugins = [
  new MiniCssExtractPlugin(),
  new ReactRefreshWebpackPlugin(),
];

export const browserConfig: Configuration = {

  mode: isDevelopmentMode ? 'development' : 'production',
  devtool: isDevelopmentMode ? 'source-map' : undefined,
  target: 'web',

  entry: {
    main: './src/bootstrap.tsx',
    'main-ssr': './src/prerender.tsx',
  },

  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, './src'),
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            ...isDevelopmentMode && { getCustomTransformers },
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

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: process.env.APP_NAME,
      filename: 'index-raw.html',
      excludeChunks: ['main-ssr'],
    }),
    ...isDevelopmentMode && developmentPlugins,
    new EnvironmentPlugin(process.env),
    new ProvidePlugin({ ...tsProvide('./src/imports.d.ts') }),
    // new CopyWebpackPlugin({
    //   patterns: [{ from: 'public' }],
    // }),
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

export const ssrConfig: Configuration = {

  mode: isDevelopmentMode ? 'development' : 'production',
  devtool: isDevelopmentMode ? 'source-map' : undefined,
  target: 'node',

  entry: './src/ssr-module.tsx',

  output: {
    filename: 'ssr-module.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs',
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, './src'),
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
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

  plugins: [
    new EnvironmentPlugin(process.env),
    new ProvidePlugin({ ...tsProvide('./src/imports.d.ts') }),
  ],

};
