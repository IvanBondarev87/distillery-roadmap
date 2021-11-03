import ReactDOM from 'react-dom';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';

const main = (
  <AppProvider>
    <Routing />
  </AppProvider>
);

window.addEventListener('DOMContentLoaded', () => {
  const serverStyleElements = document.head.querySelectorAll<HTMLStyleElement>('[data-jss]');
  ReactDOM.hydrate(
    main,
    document.getElementById('main-container'),
    () => {
      const serverStyles = document.getElementById('server-styles');
      if (serverStyles != null) document.head.removeChild(serverStyles);
      for (const styleEl of serverStyleElements) {
        document.head.removeChild(styleEl);
      }
    }
  );
});
