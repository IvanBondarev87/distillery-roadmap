import { FieldSubscription, FieldState, ARRAY_ERROR } from 'final-form';
import type { Mutators as ArrayMutators } from 'final-form-arrays';
import { useForm } from './FormContext';
import { useFormProps } from './FormPropsContext';
import useField from './useField';

interface UseFieldArrayConfig<Value> {
  validate?: FieldArrayValidator<Value>
}

const arraySubscriptions: FieldSubscription = {
  length: true,
};

function useFieldArray<Value>(name: string, config: UseFieldArrayConfig<Value>) {
  const {
    validate: validateFn,
  } = config ?? {};

  const { disabled, readOnly } = useFormProps();
  const form = useForm();

  const validate = useCallback(
    async (values) => {
      if (!validateFn) return undefined;
      const error = await validateFn(values);
      if (!error || Array.isArray(error)) {
        return error;
      }
      return { [ARRAY_ERROR]: error } as FieldArrayError;
    },
    [validateFn]
  );

  const { length } = useField<Value[]>(name, {
    subscription: arraySubscriptions,
    validate,
  });

  const map = useCallback(
    (callback: (index: number) => any) => {
      const { value: values }: FieldState<Value[]> = form.getFieldState(name) ?? Object();
      return (values ?? []).map((value, index) => callback(index));
    },
    [name]
  );

  const arrayMutators = useMemo(
    () => {
      const { push, remove } = form.mutators as unknown as ArrayMutators;
      return {
        push: (value: Value) => push(name, value),
        remove: (index: number) => remove(name, index),
      };
    },
    [name]
  );

  return {
    map,
    ...arrayMutators,
    length: length ?? 0,
    readOnly, disabled,
  };
}

export default useFieldArray;
