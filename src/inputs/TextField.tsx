import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@material-ui/core';
import { useField, shouldDisplayFieldError, fieldSubscription } from 'form';
import useDerivedFieldProps from './useDerivedFieldProps';

export type TextFieldProps = Omit<MuiTextFieldProps, 'value' | 'error' | 'type' | 'onChange' | 'onBlur'> & {
  validate?: FieldValidator<string>
  readOnly?: boolean
  type?: 'text' | 'number'
  maxLength?: number
  onChange?: (value: string) => void
}

function TextField({
  name,
  validate,
  maxLength,
  onChange,
  ...props
}: TextFieldProps) {

  const { readOnly, ...derivedProps } = useDerivedFieldProps(props);

  const field = useField<string>(name, { validate, subscription: fieldSubscription });
  const { value, change, blur } = field;
  const error = field.error ?? field.submitError;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      change(value);
      onChange?.(value);
    },
    [onChange]
  );

  const displayError = shouldDisplayFieldError(field);

  return (
    <MuiTextField
      name={name}
      {...derivedProps}

      value={value ?? ''}
      onChange={handleChange}
      onBlur={blur}

      error={displayError}
      helperText={displayError ? error : props.helperText}
      InputProps={{
        ...props.InputProps,
      }}
      inputProps={{
        maxLength,
        ...props.inputProps,
      }}
    />
  );
}

const MemoTextField = React.memo(TextField) as typeof TextField;

export default MemoTextField;
