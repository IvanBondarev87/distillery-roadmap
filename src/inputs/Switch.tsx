import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
  FormControlLabelProps,
} from '@material-ui/core';
import { useField, inputSubscription } from 'form';
import useDerivedFieldProps from './useDerivedFieldProps';

export type SwitchProps = { readOnly?: boolean; onChange?: (checked: boolean) => void; label?: string; }
  & Omit<MuiSwitchProps, 'onChange' | 'checked' | 'onBlur'>
  & Pick<FormControlLabelProps, 'labelPlacement'>

function Switch({ name, label, onChange, labelPlacement = 'start', ...props }: SwitchProps) {

  const { className, ...derivedProps } = useDerivedFieldProps(props);

  const { value, change, blur } = useField<boolean>(name, { subscription: inputSubscription });

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      change(checked);
      onChange?.(checked);
    },
    [onChange]
  );

  return (
    <FormControlLabel
      className={className}
      label={label}
      labelPlacement={labelPlacement}
      control={
        <MuiSwitch
          {...derivedProps}
          checked={value ?? false}
          onChange={handleChange}
          onBlur={blur}
        />
      }
    />
  );
}

const MemoSwitch = React.memo(Switch) as typeof Switch;

export default MemoSwitch;
