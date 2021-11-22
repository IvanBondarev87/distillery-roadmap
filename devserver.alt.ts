import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { RequestHandler } from 'express';
import { WebpackOutput, listFiles } from './dev-toolkit';

process.env = {
  HOST: 'localhost',
  PORT: '3000',
  ...dotenv.parse(
    fs.readFileSync(path.join(__dirname, '.env'))
  ),
  ...process.env,
};

async function bootstrap() {

  const { browserConfig, serverConfig } = await import('./webpack.config');
  const compiler = webpack(browserConfig);

  let chunks: string[] = null;
  compiler.hooks.afterEmit.tap('SSR', () => {
    if (chunks !== null) return;
    chunks = listFiles(compiler)
      .filter(filename => path.extname(filename) === '.js')
      .reverse();
  });

  const ssr = new WebpackOutput(serverConfig);

  const ssrMiddleware: RequestHandler = async (req, res, next) => {
    if (req.url === '/index.html') {
      try {
        const html = ssr.main?.prerender?.(chunks, req.originalUrl);
        res.send(html);
      } catch (err) {
        return next(err);
      }
    }
    next();
  };

  const { HOST: host, PORT: port } = process.env;
  const devServerOptions: WebpackDevServer.Configuration = {
    host, port,
    historyApiFallback: true,
    client: {
      progress: true,
    },
    hot: true,
    onAfterSetupMiddleware: ({ app }) => {
      app.use(ssrMiddleware);
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