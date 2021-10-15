import { FormState, FormSubscription, formSubscriptionItems } from 'final-form';
import { useForm } from './FormContext';

const allFormSubscriptions: FormSubscription = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result;
}, {});

function useFormState<
  Values extends Object = Record<string, any>,
  InitialValues extends Partial<Values> = Partial<Values>
>(subscription?: FormSubscription) {

  const form = useForm<Values, InitialValues>();
  const [formState, setFormState] = useState<FormState<Values, Partial<Values>>>();

  useEffect(() => {
    const unsubscribe = form.subscribe(state => setFormState(state), subscription ?? allFormSubscriptions);
    return unsubscribe;
  }, [subscription]);

  return formState ?? form.getState();
}

export default useFormState;
