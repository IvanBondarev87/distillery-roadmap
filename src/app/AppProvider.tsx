import { ThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import ruLocale from 'date-fns/locale/ru';
import DateFnsUtils from '@date-io/date-fns';
import { QueryClientProvider } from 'react-query';
import { Router } from 'react-router';

import { history, queryClient } from '.';
import theme from './theme';

interface AppProviderProps {
  children?: ReactNode;
}

function AppProvider({ children }: AppProviderProps) {
  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider locale={ruLocale} utils={DateFnsUtils}>
          <QueryClientProvider client={queryClient}>
            <Router history={history}>
              {children}
            </Router>
          </QueryClientProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </StylesProvider>
  );
}

export default AppProvider;
