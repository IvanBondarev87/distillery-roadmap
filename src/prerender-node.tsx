import { renderToString } from 'react-dom/server';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';
import { ServerStyleSheets } from '@material-ui/core/styles';

export const { hot } = module;
export const _webpack_require_ = __webpack_require__;

if (module.hot) {
  module.hot.accept();
}

export function renderAppToHTML(html: string, location: string) {

  const sheets = new ServerStyleSheets();
  const collectedStyleSheets = sheets.collect(
    <AppProvider location={location}>
      <Routing />
    </AppProvider>
  );
  const mainContainer = renderToString(collectedStyleSheets);
  const styleSheets = sheets.toString();
  let prerenderedHTML = html.replace('<div id="main-container"></div>', '<div id="main-container">' + mainContainer + '</div>');
  prerenderedHTML = prerenderedHTML.replace('<!-- inject -->', '<style id="server-styles">' + styleSheets + '</style>');
  return prerenderedHTML;
}
