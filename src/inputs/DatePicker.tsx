import {
  KeyboardDatePicker,
  DatePicker as MuiDatePicker,
  KeyboardDatePickerProps,
} from '@material-ui/pickers';

import { useField, shouldDisplayFieldError, fieldSubscription } from 'form';
import { classes } from 'utils';
import useDerivedFieldProps from './useDerivedFieldProps';
import { FormattedDate, makeDateFormatted } from './formatDate';

export type DatePickerProps = Omit<KeyboardDatePickerProps, 'value' | 'error' | 'onChange' |'onBlur' > & {
  validate?: FieldValidator<Date>
  serializeFormat?: 'datetime' | 'date'
  disableKeyboardInput?: boolean
  onChange?: (value: Date) => void
}

function DatePicker({
  name,
  validate,
  helperText,
  serializeFormat = 'date',
  disableKeyboardInput,
  onChange,
  ...props
}: DatePickerProps) {

  const { className, ...derivedProps } = useDerivedFieldProps(props);

  const handleValidate = useCallback((value: Date) => {
    if (value instanceof Date && isNaN(value.getTime())) return 'Неверный формат даты';
    return validate?.(value);
  }, [validate]);

  const field = useField<FormattedDate>(name, { validate: handleValidate, subscription: fieldSubscription });
  const { change, blur, error } = field;

  let { value } = field;
  value = typeof value === 'string' ? new Date(value) as FormattedDate : value;
  makeDateFormatted(value, serializeFormat);

  const handleChange = useCallback(
    (nextValue: FormattedDate) => {
      makeDateFormatted(nextValue, serializeFormat);
      change(nextValue);
      onChange?.(nextValue);
    },
    [serializeFormat, onChange]
  );

  const displayError = shouldDisplayFieldError(field);

  const DatePickerComponent = disableKeyboardInput ? MuiDatePicker : KeyboardDatePicker;
  return (
    <DatePickerComponent
      {...derivedProps}
      value={value ?? null}
      onChange={handleChange}
      onBlur={blur}
      className={classes(className, 'date-picker')}
      error={displayError}
      helperText={displayError ? error : helperText}
    />
  );
}

const MemoDatePicker = React.memo(DatePicker) as typeof DatePicker;

export default MemoDatePicker;
