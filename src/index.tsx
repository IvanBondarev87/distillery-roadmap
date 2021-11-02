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
  const script = document.createElement('script');
  script.innerText = 'window.prerendered = true;'
  document.body.appendChild(script);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    const serverStyleElements = document.head.querySelectorAll<HTMLStyleElement>('[data-jss]');
    ReactDOM.hydrate(
      main,
      document.getElementById('main-container'),
      () => {
        for (const styleEl of serverStyleElements) {
          document.head.removeChild(styleEl);
        }
      }
    );
    // setTimeout(() => {
    //   console.log('hydrate');
    //   ReactDOM.hydrate(main, document.getElementById('main-container'));
    // }, 2000);
  });
}
