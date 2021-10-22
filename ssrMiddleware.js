const puppeteer = require('puppeteer');

let page;

function ssrMiddleware(env, req, res, next) {

  var originalSend = res.send;

  res.send = async (...args) => {

    const contentType = res.getHeaders()['content-type'];
    const shouldPrerender = req.headers['x-skip-prerender'] !== '1' && req.query.skipPrerender == null;

    if (shouldPrerender && contentType.includes('text/html')) {
      console.log('__PRERENDER__');

      if (page === undefined) {
        const browser = await puppeteer.connect({ browserWSEndpoint: env.pep });
        page = await browser.newPage();
      }

      await page.setExtraHTTPHeaders({
        'x-skip-prerender': '1',
      });
      await page.goto('http://localhost:' + env.port + req.url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const script = document.createElement('script');
        script.innerText = 'window.prerendered = true;'
        document.body.appendChild(script);
      }, {});
      const prerenderedHtml = await page.content();

      originalSend.apply(res, [prerenderedHtml]);
    }

    else originalSend.apply(res, args);
  };

  next();
}

module.exports = ssrMiddleware;