import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';

const main = (
  <AppProvider>
    <Routing />
  </AppProvider>
);

// ReactDOM.render(main, document.getElementById('main-container'));
// ReactDOM.hydrate(main, document.getElementById('main-container'));
// document.getElementById('main-container').innerHTML = ReactDOMServer.renderToString(main);

if (!window.prerendered) {
  // ReactDOM.render(main, document.getElementById('main-container'));
  document.getElementById('main-container').innerHTML = ReactDOMServer.renderToString(main);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.hydrate(main, document.getElementById('main-container'));   
    // setTimeout(() => {
    //   console.log('hydrate');
    //   ReactDOM.hydrate(main, document.getElementById('main-container'));
    // }, 2000);
  });
}

