import { TypographyProps } from '@material-ui/core';
import { FormSubscription } from 'final-form';
import useFormState from './useFormState';

const subscription: FormSubscription = {
  error: true,
  submitError: true,
  submitFailed: true,
};

interface FormErrorProps extends TypographyProps {
}

function FormError(props: FormErrorProps) {

  const { error, submitError, submitFailed } = useFormState(subscription);

  const displayError = (error && typeof error === 'string' && submitFailed)
  || (submitError && typeof submitError === 'string');

  return displayError
    ? (
      <P {...props} color="error">
        {error || submitError}
      </P>
    ) : null;
}

export default React.memo(FormError);
