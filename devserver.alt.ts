import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Module from 'module';
import { createFsFromVolume, Volume, IFs } from "memfs";

let newModuleNameList: string[] = [];
// @ts-expect-error
const originalResolve = Module._resolveFilename;
// @ts-expect-error
Module._resolveFilename = function mockedFilenameResolver(request, parent) {
  if (newModuleNameList.includes(request)) {
    return request;
  }
  return originalResolve(request, parent);
};
function createModuleFromString(src: string, name: string) {
  const _module = new Module(name);
  // @ts-expect-error
  _module._compile(src, name);
  _module.filename = name;
  require.cache[name] = _module;
  newModuleNameList.push(name);
  return _module.exports;
}

function readCompilerOutputFile(compiler: webpack.Compiler, filename: string) {
  const outputPath = compiler.outputPath;
  const outputFileSystem = compiler.outputFileSystem as IFs;
  const pathToFile = path.join(outputPath, filename);
  const fileBuffer = outputFileSystem.readFileSync(pathToFile) as Buffer;
  return fileBuffer.toString();
}
function readCompilerOutputFilenameList(compiler: webpack.Compiler) {
  return new Promise<string[]>(resolve => {
    compiler.outputFileSystem.readdir(compiler.outputPath, (_, files) => {
      resolve(files as string[]);
    });
  });
}

process.env = {
  HOST: 'localhost',
  PORT: '3000',
  ...dotenv.parse(
    fs.readFileSync(path.join(__dirname, '.env'))
  ),
  ...process.env,
};

let lastFileNameList: string[] = [];
let currentManifest: any = null;
let renderModule: any = null;
let lastBuildWithErrors = false;

async function bootstrap() {

  const { browserConfig, nodeConfig } = await import('./webpack.config');
  const compiler = webpack(browserConfig);

  const renderCompiler = webpack(nodeConfig);
  renderCompiler.outputFileSystem = createFsFromVolume(new Volume());
  const createRenderModule = () => {
    const renderSrc = readCompilerOutputFile(renderCompiler, 'prerender-node.js');
    const rm = createModuleFromString(renderSrc, 'render-module');
    return rm;
  };
  renderCompiler.watch({}, async (error: Error, stats: webpack.Stats) => {

    const { errors } = stats.toJson({ errors: true });
    const hasErrors = errors?.length > 0;
    if (hasErrors) {
      lastBuildWithErrors = true;
      return;
    };

    if (renderModule === null || lastBuildWithErrors) {

      renderModule = createRenderModule();
      renderModule._webpack_require_.hmrM = () => currentManifest;
      lastBuildWithErrors = false;

    } else {

      const files = await readCompilerOutputFilenameList(renderCompiler);
      const newFiles = files.filter(f => !lastFileNameList.includes(f));

      const manifestFileNameList = newFiles.filter(f => f.split('.').pop() === 'json');
      for (const manifestFileName of manifestFileNameList) {

        const manifestSrc = readCompilerOutputFile(renderCompiler, manifestFileName);
        currentManifest = JSON.parse(manifestSrc);
        const hash = manifestFileName.split('.').slice(-3)[0];

        const updaterFileNameList = newFiles.filter(f => f.split('.').pop() === 'js' && f.includes(hash));
        for (const updaterFileName of updaterFileNameList) {
          const updaterSrc = readCompilerOutputFile(renderCompiler, updaterFileName);
          createModuleFromString(updaterSrc, './' + updaterFileName);
        }

        const { hot } = renderModule;
        const status = hot.status();
        if (status === 'idle') try {
          const updatedModules: string[] = await hot.check(true);

          if (updatedModules?.length > 0) {
            renderModule = renderModule._webpack_require_('./src/prerender-node.tsx');
            console.log('Updated modules:');
            updatedModules.forEach(moduleId => console.log(` - ${moduleId}`));
            console.log('Update applied.');
          } else {
            console.warn('Cannot find update.');
          }

        } catch (err) {

          if (['abort', 'fail'].includes(hot.status())) {
            console.warn(`Cannot apply update. ${err}`);
          } else {
            console.error('Update failed.', err);
          }
          renderModule = createRenderModule();

        }

      }

    }

    lastFileNameList = await readCompilerOutputFilenameList(renderCompiler);

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
          const html = readCompilerOutputFile(compiler, 'index-raw.html');
          const prerenderedHTML = renderModule.renderAppToHTML(html, req.originalUrl);
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