import { createTheme } from '@material-ui/core/styles';
import TimePickerIcon from '@material-ui/icons/Schedule';
import {
  DatePicker,
  KeyboardDatePicker,
  KeyboardTimePicker,
  TimePicker,
} from '@material-ui/pickers';

KeyboardDatePicker.defaultProps = {
  ...KeyboardDatePicker.defaultProps,
  format: 'dd.MM.yyyy',
  variant: 'inline',
  disableToolbar: true,
  autoOk: true,
};

DatePicker.defaultProps = {
  ...DatePicker.defaultProps,
  format: 'dd.MM.yyyy',
  variant: 'inline',
  disableToolbar: true,
  autoOk: true,
};

KeyboardTimePicker.defaultProps = {
  ...KeyboardTimePicker.defaultProps,
  variant: 'inline',
  disableToolbar: true,
  autoOk: true,
  ampm: false,
  keyboardIcon: <TimePickerIcon />,
};

TimePicker.defaultProps = {
  ...TimePicker.defaultProps,
  variant: 'inline',
  disableToolbar: true,
  autoOk: true,
  ampm: false,
};

const theme = createTheme({
  props: {
    MuiTextField: {
      variant: 'filled',
      margin: 'dense',
      autoComplete: 'off',
    },
    MuiSelect: {
      variant: 'filled',
      margin: 'dense',
      MenuProps: {
        disableScrollLock: true,
      },
    },
    MuiButton: {
      color: 'primary',
      variant: 'contained',
    },
    MuiMenu: {
      disableScrollLock: true,
    },
    MuiDialog: {
      disableScrollLock: true,
    },
  },
});

export default theme;
