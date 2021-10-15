import { getIn } from 'final-form';
import { useFormState } from 'form';

const _getIn: typeof getIn = (obj, key) => {
  if (key == null) return undefined;
  return getIn(obj, key);
};

const subscriptions = { values: true };

function useFieldValues(...names: string[]) {
  const { values } = useFormState(subscriptions);
  if (names.length === 1) return _getIn(values, names[0]);
  return names.map(name => _getIn(values, name));
}

export default useFieldValues;
