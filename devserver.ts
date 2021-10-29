import fs from 'fs';
import path from 'path';
import { RequestHandler } from 'express';
import dotenv from 'dotenv';
import chokidar from 'chokidar';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackDevServer, { Configuration as DevServerOptions } from 'webpack-dev-server';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import puppeteer, { Browser } from 'puppeteer';
import configureWebpack from './webpack.config';
import createSSRMiddleware from './createSSRMiddleware';

let server: WebpackDevServer;

const initialEnv = process.env;

let browser: Browser;
let ssrMiddleware: RequestHandler;

async function startServer() {

  if (browser === undefined) {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    ssrMiddleware = createSSRMiddleware(page);
  }

  process.env = {
    HOST: 'localhost',
    PORT: '3000',
    ...dotenv.parse(
      fs.readFileSync(path.join(__dirname, '.env'))
    ),
    ...initialEnv,
  };

  const webpackOptions = configureWebpack({
    // @ts-expect-error
    getCustomTransformers: () => ({
      before: ReactRefreshTypeScript(),
    }),
    styleLoader: MiniCssExtractPlugin.loader,
    plugins: [
      new MiniCssExtractPlugin(),
      new ReactRefreshWebpackPlugin(),
    ],
  });
  
  const compiler = webpack(webpackOptions);

  const devServerOptions: DevServerOptions = {
    host: process.env.HOST,
    port: process.env.PORT,
    historyApiFallback: true,
    client: {
      progress: true,
    },
    hot: true,
    onBeforeSetupMiddleware: ({ app }) => {
      app.use(ssrMiddleware);
    },
  };
  
  server = new WebpackDevServer(devServerOptions, compiler);

  await server.start();
};

startServer();

const watcher = chokidar.watch([
  'tsconfig.json',
  'webpack.config.ts',
  'createSSRMiddleware.ts',
  '.env',
]);

watcher.on('change', async () => {
  await server.stop();
  startServer();
});

process.on('exit', () => {
  browser.close();
});

// import child_process from 'child_process'
// /^win/.test(process.platform) ? 'npx.cmd' : 'npx'
  // child_process.spawn('npx.cmd', ['ts-node', '--transpile-only', 'devserver.ts'], {
  //   cwd: process.cwd(),
  //   // detached : true,
  //   stdio: 'inherit',
  // })
  //.unref();
  // process.exit();

// USING WEBPACK_DEV_MIDDLEWARE

// import webpackDevMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';
// import express from 'express';

// const conf1 = config({});
// conf1.plugins.push(new webpack.HotModuleReplacementPlugin());
// conf1.entry = [conf1.entry, './node_modules/webpack/hot/dev-server.js'];
// // conf1.entry = [conf1.entry, 'webpack-hot-middleware/client'];

// const compiler1 = webpack(conf1);

// const app = express();

// app.use(webpackDevMiddleware(compiler1));

// // app.use(webpackHotMiddleware(compiler));

// app.listen(5000, () => console.log("Example app listening on port 5000!"));