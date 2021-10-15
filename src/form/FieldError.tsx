import useField from './useField';
import { errorSubscription } from './subscriptions';
import shouldDisplayFieldError from './shouldDisplayFieldError';

interface FieldErrorProps {
  name?: string
  component?: 'div' | 'span'
}

function FieldError({ name, component: Component }: FieldErrorProps) {

  const field = useField(name, { subscription: errorSubscription });

  const displayError = shouldDisplayFieldError(field);
  const { error, submitError } = field;

  return displayError
    ? (
      <P component={Component} color="error">
        {error || submitError}
      </P>
    ) : null;
}

export default React.memo(FieldError);
