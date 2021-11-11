import { createBrowserHistory, Location } from 'history';

declare global {
  interface LocationState {
    routeBackLocation?: Location<LocationState>;
  }
}

const history = isServerRendering ? undefined : createBrowserHistory<LocationState>();

export default history;
