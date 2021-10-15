import { FormSubscription } from 'final-form';
import useFormState from './useFormState';

const subscription: FormSubscription = {
  error: true,
  submitError: true,
  submitFailed: true,
};

interface FormErrorProps {
  component?: 'div' | 'span'
}

function FormError({ component: Component }: FormErrorProps) {

  const { error, submitError, submitFailed } = useFormState(subscription);

  const displayError = (error && typeof error === 'string' && submitFailed)
  || (submitError && typeof submitError === 'string');

  return displayError
    ? (
      <P component={Component} color="error">
        {error || submitError}
      </P>
    ) : null;
}

export default React.memo(FormError);
