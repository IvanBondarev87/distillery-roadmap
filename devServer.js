const path = require('path');
const nodemon = require('nodemon');
const puppeteer = require('puppeteer');
const killPort = require('kill-port');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

async function bootstrap() {
  const browser = await puppeteer.launch({ headless: true });
  const pep = browser.wsEndpoint();
  const pepOpt = `--env pep=${pep}`;
  
  const { port = 3000 } = {
    ...dotenv.parsed,
    ...process.env,
  };

  nodemon({
    exec: `npx webpack serve ${pepOpt}`,
    watch: [
      'tsconfig.json',
      'webpack.config.js',
      'ssrMiddleware.js',
      '.env',
    ],
  })

  .on('start', () => {
    console.log('nodemon started');
  })

  .on('crash', () => {
    console.log('nodemon crashed');
    killPort(port);
  })

  .on('restart', () => {
    console.log('nodemon restarted');
    killPort(port);
  })

  .on('quit', async () => {
    await browser.close();
    console.log('nodemon exited');
  });
}

bootstrap();
