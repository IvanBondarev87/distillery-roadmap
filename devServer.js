const path = require('path');
const nodemon = require('nodemon');
const puppeteer = require('puppeteer');
const killPort = require('kill-port');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

async function bootstrap() {
  let { port = 3000, host = 'localhost' } = {
    ...dotenv.parsed,
    ...process.env,
  };
  if (process.argv[2] === '--deploy') {
    port = process.argv[3];
    host = process.argv[4];
  }

  const browserOpts = {};
  
  if (process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
    browserOpts.executablePath = 'google-chrome-stable';
    browserOpts.args = ['--no-sandbox'];
  };
  const browser = await puppeteer.launch({ ...browserOpts, headless: true  });
  const pep = browser.wsEndpoint();
  const pepOpt = `--env pep=${pep}`;

  nodemon({
    exec: `npx webpack serve ${pepOpt} --env port=${port} --env host=${host}`,
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
