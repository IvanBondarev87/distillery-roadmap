import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
} from '@material-ui/core';
import { useField, inputSubscription } from 'form';
import useDerivedFieldProps from './useDerivedFieldProps';
import toggleValueInArray from './toggleValueInArray';

type CheckboxProps = { readOnly?: boolean; onChange?: (checked: boolean) => void }
  & Omit<MuiCheckboxProps, 'onChange' | 'checked' | 'onBlur'>
  & Pick<FormControlLabelProps, 'label' | 'labelPlacement'>

function Checkbox({ name, value: option, label, labelPlacement, onChange, ...props }: CheckboxProps) {

  const { className, ...derivedProps } = useDerivedFieldProps(props);

  const { value, change, blur } = useField<boolean | unknown[]>(name, { subscription: inputSubscription });

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (option != null) {
      change((selectedOptions: unknown[]) => toggleValueInArray(selectedOptions, option));
    } else change(event.target.checked);
    onChange?.(event.target.checked);
  }, [option, onChange]);

  const checked = value instanceof Array
    ? value.includes(option)
    : value;

  return (
    <FormControlLabel
      className={className}
      labelPlacement={labelPlacement ?? (option != null ? 'end' : 'start')}
      label={label}
      control={
        <MuiCheckbox
          {...derivedProps}
          checked={checked ?? false}
          onChange={handleChange}
          onBlur={blur}
        />
      }
    />
  );
}

const MemoCheckbox = React.memo(Checkbox) as typeof Checkbox;

export default MemoCheckbox;
