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

global.isServerRendering = true;
global.renderAppToHTML = null;

async function bootstrap() {

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  //   args: [
  //     '--profile-directory=render-profile',
  //   ],
  // });
  // const page = (await browser.pages())[0];
  // await page.setRequestInterception(true);

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

  // page.on('request', request => {
  //   if (request.resourceType() === 'document') {
  //     const indexHTMLPath = path.join(compiler.outputPath, 'index-raw.html');
  //     const indexHTMLFile = compiler.compilers[1].outputFileSystem.readFileSync(indexHTMLPath);
  //     const html = indexHTMLFile.toString();
  //     request.respond({
  //       body: html,
  //     });
  //   } else
  //     request.continue();
  // });

  compiler.compilers[1].hooks.afterEmit.tapAsync('SSRPlugin', (params, callback) => {
    if (global.renderAppToHTML == null) {
      const ssrModulePath = path.join(compiler.outputPath, 'ssr-module.js');
      // @ts-expect-error
      const ssrModuleFile: Buffer = compiler.compilers[1].outputFileSystem.readFileSync(ssrModulePath);
      const ssrModuleSrouce = ssrModuleFile.toString();
      eval(ssrModuleSrouce);
    }
    callback();
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

          const indexHTMLPath = path.join(compiler.outputPath, 'index-raw.html');
          // @ts-expect-error
          const indexHTMLFile: Buffer = compiler.compilers[0].outputFileSystem.readFileSync(indexHTMLPath);
          const indexHTMLSrouce = indexHTMLFile.toString();

          const { html, css } = global.renderAppToHTML(req.originalUrl);
          let resHTML = indexHTMLSrouce.replace('<div id="main-container"></div>', '<div id="main-container">' + html + '</div>');
          resHTML = resHTML.replace('<!-- inject -->', '<style id="server-styles">' + css + '</style>');
          res.send(resHTML);
        }

        // if (req.url === '/index.html') {
        //   await page.goto('http://' + process.env.HOST + ':' + process.env.PORT + req.originalUrl, { waitUntil: 'domcontentloaded' });
        //   const prerenderedHtml = await page.content();
        //   res.send(prerenderedHtml);
        // }

        next();
      });
    }
  };

  const server = new WebpackDevServer(devServerOptions, compiler);
  await server.start();
};

bootstrap();

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