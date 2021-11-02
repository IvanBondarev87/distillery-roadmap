import { renderToString } from 'react-dom/server';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';
import { ServerStyleSheets } from '@material-ui/core/styles';

renderAppToHTML = (location: string) => {
  const sheets = new ServerStyleSheets();
  const colleted = sheets.collect(
    <AppProvider location={location}>
      <Routing />
    </AppProvider>
  );
  const html = renderToString(colleted);
  const css = sheets.toString();
  return { html, css };
};