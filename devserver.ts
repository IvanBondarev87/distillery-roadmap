import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackDevServer, { Configuration as DevServerOptions } from 'webpack-dev-server';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import puppeteer from 'puppeteer';
import configureWebpack from './webpack.config';
// import { WebpackDevMiddleware } from 'webpack-dev-middleware';

async function bootstrap() {

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    args: [
      '--profile-directory=render-profile',
    ],
  });
  const page = (await browser.pages())[0];
  await page.setRequestInterception(true);

  process.env = {
    HOST: 'localhost',
    PORT: '3000',
    ...dotenv.parse(
      fs.readFileSync(path.join(__dirname, '.env'))
    ),
    ...process.env,
  };

  const webpackOptions = configureWebpack({
    getCustomTransformers: () => ({
      before: [ReactRefreshTypeScript()],
    }),
    styleLoader: MiniCssExtractPlugin.loader,
    plugins: [
      new MiniCssExtractPlugin(),
      new ReactRefreshWebpackPlugin(),
    ],
  });

  const compiler = webpack(webpackOptions);

  page.on('request', request => {
    if (request.resourceType() === 'document')
      request.respond({
        // @ts-expect-error
        body: compiler.outputFileSystem.readFileSync(path.join(compiler.outputPath, 'index-raw.html')).toString(),
      });
    else
      request.continue();
  });

  const devServerOptions: DevServerOptions = {
    host: process.env.HOST,
    port: process.env.PORT,
    historyApiFallback: true,
    client: {
      progress: true,
    },
    hot: true,
    onAfterSetupMiddleware: ({ app }) => {
      app.use(async (req, res, next) => {
        if (req.url === '/index.html') {
          await page.goto('http://' + process.env.HOST + ':' + process.env.PORT + req.originalUrl, { waitUntil: 'domcontentloaded' });
          const prerenderedHtml = await page.content();
          res.send(prerenderedHtml);
        }
        next();
      });
    }
  };

  const server = new WebpackDevServer(devServerOptions, compiler);
  await server.start();
};

bootstrap();

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