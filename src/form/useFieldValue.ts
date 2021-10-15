import { FieldState, getIn } from 'final-form';
import { useForm } from './FormContext';
import { useName } from './NameContext';

function useFieldValue<Value>(name: string) {

  name = useName(name);
  const form = useForm();

  const [fieldState, setFieldState] = useState<FieldState<Value>>(
    () => form.getFieldState(name)?.value ?? getIn(form.getState().values, name) ?? {}
  );

  useEffect(() => {
    const unsubscribe = form.registerField(name, setFieldState, { value: true });
    return unsubscribe;
  }, [name]);

  return fieldState.value;
}

export default useFieldValue;
