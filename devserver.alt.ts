import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Module from 'module';
import { createFsFromVolume, Volume, IFs } from "memfs";
// import rfs from 'require-from-string';

global.isServerRendering = true;

function readOutputFile(compiler: webpack.Compiler, filename: string) {
  const outputPath = compiler.outputPath;
  const outputFileSystem = compiler.outputFileSystem as IFs;
  const pathToFile = path.join(outputPath, filename);
  const fileBuffer = outputFileSystem.readFileSync(pathToFile) as Buffer;
  return fileBuffer.toString();
}

process.env = {
  HOST: 'localhost',
  PORT: '3000',
  ...dotenv.parse(
    fs.readFileSync(path.join(__dirname, '.env'))
  ),
  ...process.env,
};

let initialFiles: string[] = [];
let mainModule: Module = null;
let lastModuleName: string = null;
let lastManifest: string = null;

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function mockedFilenameResolver(request, parent) {
  if (request === lastModuleName) {
    return lastModuleName;
  }
  return originalResolve(request, parent);
};

async function bootstrap() {

  const { browserConfig, nodeConfig } = await import('./webpack.config');
  const compiler = webpack(browserConfig);

  const compiler1 = webpack(nodeConfig);
  const fss = createFsFromVolume(new Volume());
  compiler1.outputFileSystem = fss;

  compiler1.watch({}, (error: Error, serverStats: webpack.Stats) => {
    if (mainModule === null) {

      const prerenderSrc = readOutputFile(compiler1, 'prerender-node.js');

      const moduleName = 'render-module';
      mainModule = new Module(moduleName);
      mainModule._compile(prerenderSrc, moduleName);

      mainModule.exports._webpack_require_.hmrM = () => lastManifest;

      compiler1.outputFileSystem.readdir(compiler1.outputPath, (_, files) => {
        initialFiles = files as string[];
      });

    } else {

      compiler1.outputFileSystem.readdir(compiler1.outputPath, (_, files) => {

        const newFiles = (files as string[]).filter(f => !initialFiles.includes(f));

        const manifestFileName = newFiles.filter(f => f.split('.').pop() === 'json')[0];
        const manifestFile = readOutputFile(compiler1, manifestFileName);
        lastManifest = JSON.parse(manifestFile);

        const updateFileName = newFiles.filter(f => f.split('.').pop() === 'js')[0];
        const updateFile = readOutputFile(compiler1, updateFileName);
        const moduleName = './' + updateFileName;
        const updateModule = new Module(moduleName);
        updateModule._compile(updateFile, moduleName);
        updateModule.filename = moduleName;
        require.cache[moduleName] = updateModule;
        lastModuleName = moduleName;

        initialFiles = files as string[];
        // mainModule.exports.__updateModules__();

        mainModule.exports.hot.check(true)
          .then(() => {
            const mm = mainModule.exports._webpack_require_('./src/prerender-node.tsx');
            mainModule.exports.renderer.renderAppToHTML = mm.renderer.renderAppToHTML;
          })
          .catch((error) => {
            console.log('error:', error);
          });

      });

    }

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
          const html = readOutputFile(compiler, 'index-raw.html');
          const prerenderedHTML = mainModule.exports.renderer.renderAppToHTML(html, req.originalUrl);
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