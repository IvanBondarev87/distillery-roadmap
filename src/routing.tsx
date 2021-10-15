import NotFound from 'pages/notfound';
import { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { lazy } from 'utils';

const Main = lazy(() => import('./pages/main'));

const Routing = () => {

  return (
    <Suspense fallback={<></>}>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
};

export default Routing;
