import {
  Radio as MuiRadio,
  RadioProps as MuiRadioProps,
  FormControlLabel,
  FormControlLabelProps,
} from '@material-ui/core';
import { useField, inputSubscription } from 'form';
import useDerivedFieldProps from './useDerivedFieldProps';

type RadioProps = { readOnly?: boolean; onChange?: (checked: boolean) => void }
  & Omit<MuiRadioProps, 'onChange' | 'checked' | 'onBlur'>
  & Pick<FormControlLabelProps, 'label' | 'labelPlacement'>

function Radio({ name, value: option, label, labelPlacement, onChange, ...props }: RadioProps) {

  const { className, ...derivedProps } = useDerivedFieldProps(props);

  const { value, change, blur } = useField(name, { subscription: inputSubscription });

  const handleChange = useCallback(() => {
    change(option);
    onChange?.(true);
  }, [onChange]);

  return (
    <FormControlLabel
      className={className}
      label={label}
      labelPlacement={labelPlacement ?? 'end'}
      control={
        <MuiRadio
          {...derivedProps}
          checked={value === option}
          onChange={handleChange}
          onBlur={blur}
        />
      }
    />
  );
}

const MemoRadio = React.memo(Radio) as typeof Radio;

export default MemoRadio;
