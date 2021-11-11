import { ThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import ruLocale from 'date-fns/locale/ru';
import DateFnsUtils from '@date-io/date-fns';
import { QueryClientProvider } from 'react-query';
import { Router, StaticRouter } from 'react-router';

import { history, queryClient } from '.';
import theme from './theme';

interface AppProviderProps {
  children?: ReactNode;
  location?: string;
}

function AppProvider({ children, location }: AppProviderProps) {
  
  const inner = (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider locale={ruLocale} utils={DateFnsUtils}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </StylesProvider>
  );

  if (isServerRendering) return (
    <StaticRouter location={location}>
      {inner}
    </StaticRouter>
  );

  return (
    <Router history={history}>
      {inner}
    </Router>
  );
}

export default AppProvider;
