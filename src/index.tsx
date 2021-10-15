import ReactDOM from 'react-dom';
import AppProvider from 'app/AppProvider';
import Routing from 'routing';

const main = (
  <AppProvider>
    <Routing />
  </AppProvider>
);
ReactDOM.render(main, document.getElementById('main-container'));
