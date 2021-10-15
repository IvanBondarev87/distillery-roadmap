import { setHours, setMinutes } from 'date-fns';
import {
  KeyboardTimePicker,
  TimePicker as MuiTimePicker,
  KeyboardTimePickerProps,
} from '@material-ui/pickers';

import { useField, shouldDisplayFieldError, fieldSubscription } from 'form';
import { classes } from 'utils';
import useDerivedFieldProps from './useDerivedFieldProps';
import { FormattedDate, makeDateFormatted } from './formatDate';

export type TimePickerProps = Omit<KeyboardTimePickerProps, 'value' | 'onChange' | 'error'> & {
  validate?: FieldValidator<Date>
  disableKeyboardInput?: boolean
  onChange?: (value: Date) => void
}

function TimePicker({
  name,
  validate,
  helperText,
  disableKeyboardInput,
  onChange,
  ...props
}: TimePickerProps) {

  const { className, ...derivedProps } = useDerivedFieldProps(props);

  const handleValidate = useCallback((value: Date) => {
    if (value instanceof Date && isNaN(value.getTime())) return 'Неверный формат времени';
    return validate?.(value);
  }, [validate]);

  const field = useField<FormattedDate>(name, { validate: handleValidate, subscription: fieldSubscription });
  const { change, blur, error } = field;

  let { value } = field;
  value = typeof value === 'string' ? new Date('0000-01-01T' + value) as FormattedDate : value;
  makeDateFormatted(value, 'time');

  const handleChange = useCallback(
    (nextValue: FormattedDate) => {
      makeDateFormatted(nextValue, 'time');
      change(nextValue);
      onChange?.(nextValue);
    },
    [onChange]
  );

  const displayError = shouldDisplayFieldError(field);

  const TimePickerComponent = disableKeyboardInput ? MuiTimePicker : KeyboardTimePicker;
  return (
    <TimePickerComponent
      {...derivedProps}
      value={value ?? null}
      onChange={handleChange}
      onBlur={blur}
      className={classes(className, 'time-picker')}
      error={displayError}
      helperText={displayError ? error : helperText}
    />
  );
}

const MemoTimePicker = React.memo(TimePicker) as typeof TimePicker;

export default MemoTimePicker;
