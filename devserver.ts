import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer, { Configuration } from 'webpack-dev-server';
import puppeteer from 'puppeteer';

process.env = {
  HOST: 'localhost',
  PORT: '3000',
  ...dotenv.parse(
    fs.readFileSync(path.join(__dirname, '.env'))
  ),
  ...process.env,
};

async function bootstrap() {

  const { browserConfig } = await import('./webpack.config');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    args: [
      '--profile-directory=server-profile',
    ],
  });
  const page = (await browser.pages())[0];
  await page.setRequestInterception(true);

  const compiler = webpack(browserConfig);

  page.on('request', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'document') {
      // @ts-expect-error
      const entryFile = compiler.outputFileSystem.readFileSync(
        path.join(compiler.outputPath, 'index-raw.html')
      );
      const initialHTML = entryFile.toString();
      request.respond({
        body: initialHTML,
      });
    } else if (resourceType === 'script') {
      const scriptName = request.url().split('/').pop();
      if (scriptName === 'main.js') {
        // @ts-expect-error
        const ssrScript = compiler.outputFileSystem.readFileSync(
          path.join(compiler.outputPath, 'js/main-ssr.js')
        );
        const ssrSource = ssrScript.toString();
        request.respond({
          body: ssrSource,
        });
      } else request.continue();
    } else 
      request.continue();
  });

  const devServerOptions: Configuration = {
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
          const prerenderedHTML = await page.content();
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
