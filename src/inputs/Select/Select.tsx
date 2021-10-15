import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  FormControl,
  InputLabel,
  FormHelperText,
  MenuItem,
} from '@material-ui/core';

import { useField, shouldDisplayFieldError, fieldSubscription } from 'form';
import isReactElement from 'utils/isReactElement';
import SelectContext from './SelectContext';
import { SelectItemProps } from './SelectItem';
import toggleValueInArray from '../toggleValueInArray';
import useDerivedFieldProps from '../useDerivedFieldProps';

function renderValue(value: unknown, children: ReactNode) {
  const nodeList = React.Children.toArray(children);

  if (value instanceof Array) {
    const selectedItems = nodeList.filter(child => {
      if (!isReactElement(child)) return false;
      return value.includes(child.props.value);
    });
    const disaplayedValues = selectedItems.map(
      ({ props }: ReactElement<SelectItemProps>) => props.label || props.children || props.value
    );
    return typeof disaplayedValues[0] === 'string' ? disaplayedValues.join(', ') : disaplayedValues;
  }

  const selectedItem = nodeList.find(child => {
    if (!isReactElement(child)) return false;
    return child.props.value === value;
  });
  const selectedItemProps = (selectedItem as ReactElement)?.props || {};
  return selectedItemProps.label || selectedItemProps.children || selectedItemProps.value;
}

export interface SelectProps extends Omit<MuiSelectProps, 'renderValue'> {
  validate?: FieldValidator<unknown>
  label?: string
  helperText?: string
  outOfRange?: boolean
  onChange?: (value: unknown) => void
}

function Select({
  name,
  validate,
  label,
  helperText,
  multiple,
  children,
  displayEmpty,
  style,
  fullWidth,
  outOfRange,
  variant = 'filled',
  required,
  margin = 'dense',
  onChange,
  ...props
}: SelectProps) {

  const { disabled, className, ...derivedProps } = useDerivedFieldProps(props);

  const field = useField<unknown>(name, { validate, subscription: fieldSubscription });
  const { value, change, blur, error } = field;

  const displayError = shouldDisplayFieldError(field);
  helperText = displayError ? error : helperText;

  const handleChange = useCallback((event, child: ReactElement) => {
    const option = child.props.value;
    let nextValue: unknown;
    if (multiple) {
      change((selectedOptions: unknown[]) => {
        nextValue = toggleValueInArray(selectedOptions, option);
        return nextValue;
      });
    } else {
      nextValue = option;
      change(nextValue);
    }
    onChange?.(nextValue);
  }, [multiple, onChange]);

  let displayedValue = renderValue(value, children);
  displayedValue = displayEmpty ? displayedValue : (value != null && value !== '' && displayedValue) || undefined;

  return (
    <SelectContext.Provider value={{ value, multiple }}>
      <FormControl
        error={displayError}
        {...{ style, fullWidth, margin, className }}
      >
        <InputLabel {...{ required, variant }} shrink={Boolean(displayedValue)}>
          {label}
        </InputLabel>
        <MuiSelect
          {...{ displayEmpty, multiple, variant, label, disabled, margin, ...derivedProps }}
          renderValue={() => displayedValue}
          value={value ?? (multiple ? [] : '')}
          onChange={handleChange}
          onBlur={blur}
        >
          {React.Children.map(children, child => {
            if (!isReactElement(child)) return null;
            return (
              <MenuItem value={child.props.value} disabled={child.props.disabled}>
                {child}
              </MenuItem>
            );
          })}
          {/* @ts-expect-error */}
          {outOfRange && <MenuItem className="non-displayed" value={value} />}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </SelectContext.Provider>
  );
}

const MemoSelect = React.memo(Select) as typeof Select;

export default MemoSelect;
