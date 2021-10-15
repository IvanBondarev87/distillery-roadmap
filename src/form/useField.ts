import { FieldState, FieldSubscription, getIn, ARRAY_ERROR } from 'final-form';

import { useMutableState } from 'hooks';
import { useForm } from './FormContext';
import { useName } from './NameContext';

declare global {
  type FieldArrayError = string[] & { [ARRAY_ERROR]?: string }
  type FieldError = string | FieldArrayError
  type FieldValidator<Value> = (value: Value) => FieldError | Promise<FieldError>
  type FieldArrayValidator<Value> = (values: Value[]) => FieldError | Promise<FieldError>
}

interface UseFieldConfig<Value> {
  subscription?: FieldSubscription
  validate?: FieldValidator<Value>
}

interface UseFieldMutableState<Value> {
  change: (value: Value | ((currentValue: Value) => Value)) => void;
  blur: () => void;
  name: string;
}

function useField<Value>(name: string, config: UseFieldConfig<Value>) {
  const { subscription, validate } = config;

  name = useName(name);
  const form = useForm();

  const [fieldState, setFieldState] = useState<FieldState<Value>>();

  useEffect(() => {
    const validateFn =
      validate instanceof Function
        ? validate
        : undefined;
    const { index: indexOfDelimiter } = /\.|\[/.exec(name) ?? {};
    const endIndex = indexOfDelimiter ? indexOfDelimiter + (name[indexOfDelimiter] === '[' ? 1 : 0) : undefined;
    const validateFields = indexOfDelimiter ? [name.slice(0, endIndex - 1)] : [];
    const fieldConfig = {
      getValidator: () => validateFn ? (value: Value) => validateFn(value) : undefined,
      validateFields,
    };
    const unsubscribe = form.registerField(name, setFieldState, subscription, fieldConfig);
    return unsubscribe;
  }, [name, subscription, validate]);

  const current = useMutableState<UseFieldMutableState<Value>>();
  if (current.change === undefined) {
    current.change = value => {
      if (value instanceof Function) {
        const currentValue = form.getFieldState(current.name)?.value ?? getIn(form.getState().values, current.name);
        const nextValue = value(currentValue);
        form.change(current.name, nextValue);

      } else form.change(current.name, value);
    };
    current.blur = () => form.blur(current.name);
  }
  current.name = name;

  const { change, blur } = current;
  return {
    ...(
      fieldState
      ?? form.getFieldState(name)
      ?? { value: getIn(form.getState().values, name) }
    ) as FieldState<Value>,
    change,
    blur,
  };
}

export default useField;
