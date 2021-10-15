import { FieldSubscription } from 'final-form';
import useField from './useField';
import { NameProvider } from './NameContext';

const subscription: FieldSubscription = {};

interface FieldProps<Value> {
  name: string
  validate?: FieldValidator<Value>
  children: ReactNode
}

function Field<Value>({ name, validate, children }: FieldProps<Value>) {

  useField(name, { validate, subscription });

  return (
    <NameProvider value={name}>
      {children}
    </NameProvider>
  );
}

export default Field;
