import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

global.isServerRendering = true;
global.renderAppToHTML = null;

process.env = {
  HOST: 'localhost',
  PORT: '3000',
  ...dotenv.parse(
    fs.readFileSync(path.join(__dirname, '.env'))
  ),
  ...process.env,
};

async function bootstrap() {

  const { browserConfig, nodeConfig } = await import('./webpack.config');
  const compiler = webpack([browserConfig, nodeConfig]);

  compiler.compilers[1].hooks.afterEmit.tapAsync('PrerenderPlugin', (params, callback) => {
    // if (global.renderAppToHTML == null) {
      const prerenderPath = path.join(compiler.outputPath, 'prerender-node.js');
      // @ts-expect-error
      const prerenderFile: Buffer = compiler.compilers[1].outputFileSystem.readFileSync(prerenderPath);
      const prerenderSource = prerenderFile.toString();
      console.log('reeval')
      eval(prerenderSource);
    // }
    callback();
  });

  const { HOST: host, PORT: port } = process.env;
  const devServerOptions: WebpackDevServer.Configuration = {
    host, port,
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
          const html = indexHTMLFile.toString();

          const prerenderedHTML = global.renderAppToHTML(html, req.originalUrl);
          res.send(prerenderedHTML);
        }

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