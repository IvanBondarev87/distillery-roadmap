import ReactDOMServer from 'react-dom/server';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';

const main = (
  <AppProvider>
    <Routing />
  </AppProvider>
);

document.getElementById('main-container').innerHTML = ReactDOMServer.renderToString(main);
