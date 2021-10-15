import { createBrowserHistory, Location } from 'history';

declare global {
  interface LocationState {
    routeBackLocation?: Location<LocationState>;
  }
}

const history = createBrowserHistory<LocationState>();

export default history;
