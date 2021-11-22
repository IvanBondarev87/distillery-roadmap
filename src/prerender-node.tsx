import { renderToString } from 'react-dom/server';
import { ServerStyleSheets } from '@material-ui/core/styles';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';

if (module.hot) {
  module.hot.accept();
}

export function prerender(chunks: string[], location: string) {

  const styleSheets = new ServerStyleSheets();
  const mainContent = renderToString(
    styleSheets.collect(
      <AppProvider location={location}>
        <Routing />
      </AppProvider>
    )
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${process.env.APP_NAME}</title>
        <style id="server-styles">
          ${styleSheets.toString()}
        </style>
        ${chunks.map(filename => `<script defer src="/${filename}"></script>`).join('\n')}
      </head>
      <body>
        <div id="main-container">${mainContent}</div>
        <br />
      </body>
    </html>
  `;
}
