import fs from 'fs';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import puppeteer from 'puppeteer';

function redirectPuppeteerFileRequest(puppeteerRequest: puppeteer.HTTPRequest, path: string) {

  const { HOST: hostname, PORT: port } = process.env;
  const req = http.request({
    hostname, port,
    method: 'GET',
    path,
    headers: puppeteerRequest.headers(),
  }, res => {

    const chunks = [];
    res.on('data', chunk => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      puppeteerRequest.respond({
        status: res.statusCode,
        body: Buffer.concat(chunks).toString(),
        headers: { ...res.headers },
      });
    });

  });

  req.end();
}

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
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'document') {
      redirectPuppeteerFileRequest(request, '/index-raw.html');
    } else if (resourceType === 'script' && request.url().split('/').pop() === 'main.js') {
      redirectPuppeteerFileRequest(request, '/js/prerender.js');
    } else {
      request.continue();
    }
  });

  const compiler = webpack(browserConfig);

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
