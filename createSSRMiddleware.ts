import { RequestHandler } from 'express';
import { Page } from 'puppeteer';

function createSSRMiddleware(page: Page): RequestHandler {
  return (req, res, next) => {

    var originalSend = res.send;

    // @ts-expect-error
    res.send = async (...args) => {
  
      const contentType = res.getHeaders()['content-type'];
      const shouldPrerender = req.headers['x-skip-prerender'] !== '1' && req.query.skipPrerender == null;
  
      // @ts-expect-error
      if (shouldPrerender && contentType.includes('text/html')) {
        console.log('__PRERENDER__');
  
        await page.setExtraHTTPHeaders({
          'x-skip-prerender': '1',
        });
        await page.goto('http://' + process.env.HOST + ':' + process.env.PORT + req.url, { waitUntil: 'domcontentloaded' });
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

  };
}

export default createSSRMiddleware;