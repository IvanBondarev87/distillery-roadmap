import { TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete as MuiAutocomplete, AutocompleteRenderInputParams } from '@material-ui/lab';

import { useField, shouldDisplayFieldError, fieldSubscription } from 'form';
import { useMutableState } from 'hooks';
import { classes } from 'utils';
import shallowEqual from 'utils/shallowEqual'
import useDerivedFieldProps from './useDerivedFieldProps';

export type AutocompleteProps = Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur'> & {
  validate?: FieldValidator<OptionValue | OptionValue[]>;
  getOptionValue: (option: SelectOption) => OptionValue;
  selectFirst?: boolean;
  readOnly?: boolean;

  filterValues?: boolean;
  multiple?: boolean;
  getOptionLabel: (option: SelectOption) => string;
  renderOption?: (option: SelectOption) => ReactNode;
  options?: SelectOption[];
  onChange?: (value: OptionValue | OptionValue[]) => void
}

function Autocomplete({
  name,
  validate,
  selectFirst,
  filterValues,
  getOptionValue,

  fullWidth,
  multiple,
  getOptionLabel,
  renderOption,
  options,

  onChange,
  ...props
}: AutocompleteProps) {

  const { className, disabled, ...derivedProps } = useDerivedFieldProps(props);

  const field = useField<OptionValue | OptionValue[]>(name, { validate, subscription: fieldSubscription });
  const { value, change, blur, error } = field;

  const shouldDisplayError = shouldDisplayFieldError(field);

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...derivedProps}
      {...params}
      error={shouldDisplayError}
      helperText={shouldDisplayError ? error : props.helperText}
    />
  );

  // alters field value by deleting items that has no corresponding option value
  useEffect(() => {
    if (!filterValues || options == null || value == null) return;
    const optionValues = options.map(getOptionValue);
    if (value instanceof Array) {
      if (value.length === 0) return;
      const filteredValue = value.filter(val => optionValues.includes(val));
      if (!shallowEqual(filteredValue, value)) change(filteredValue);
    } else if (!optionValues.includes(value)) change(null);
  }, [filterValues, getOptionValue, options]);
  //

  // setlectFirst routine
  const current = useMutableState<{ firstSelected: boolean }>();
  if (current.firstSelected === undefined) {
    current.firstSelected = !(value instanceof Array ? value.length === 0 : value == null);
  }
  useEffect(() => {
    if (!selectFirst || current.firstSelected) return;
    const firstOption = options?.[0];
    if (firstOption === undefined) return;
    const value = getOptionValue(firstOption);
    change(multiple ? [value] : value);
    current.firstSelected = true;
  }, [selectFirst, options, multiple, getOptionValue]);
  //

  const handleChange = useCallback(
    (event, selected: SelectOption | SelectOption[]) => {
      const nextValue =
        selected instanceof Array
          ? selected.map(getOptionValue)
          : selected == null ? null : getOptionValue(selected);
      change(nextValue);
      onChange?.(nextValue);
    },
    [getOptionValue, onChange]
  );

  const selectedOptions = useMemo(() => {
    if (multiple && value instanceof Array)
      return options?.filter(option => value.includes(getOptionValue(option)));
    const option = options?.find(option => getOptionValue(option) === value);
    if (!multiple) return option;
    if (option !== undefined) return [option];
  }, [multiple, getOptionValue, options, value]);

  return (
    <MuiAutocomplete<SelectOption, boolean>
      className={classes(className)}
      filterSelectedOptions={multiple}
      renderOption={renderOption || getOptionLabel}
      value={selectedOptions ?? (multiple ? [] : null)}
      onChange={handleChange}
      onBlur={blur}
      {...{
        multiple, fullWidth, disabled,
        getOptionLabel, renderInput,
        options,
      }}
    />
  );
}

const MemoAutocomplete = React.memo(Autocomplete) as typeof Autocomplete;

export default MemoAutocomplete;
