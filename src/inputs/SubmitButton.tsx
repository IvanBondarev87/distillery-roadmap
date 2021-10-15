import { Button } from '@material-ui/core';
import { useForm, useFormState, useFormProps, FormSubscription } from 'form';

type SubmitButtonProps<Component extends React.ElementType> =
  Omit<React.ComponentProps<Component>, 'component'> & {
  disablePristine?: boolean
  disabled?: boolean
  component?: Component
}

const subscription: FormSubscription = {
  hasValidationErrors: true,
  submitFailed: true,
  dirtySinceLastSubmit: true,
  pristine: true,
  submitting: true,
  validating: true,
};

function SubmitButton<Component extends React.ElementType = typeof Button>({
  disablePristine = false,
  disabled,
  ...props
}: SubmitButtonProps<Component>) {

  const { component, ...derivedProps } = {
    children: 'Отправить',
    ...props,
  } as SubmitButtonProps<Component>;

  const form = useForm();

  const formProps = useFormProps();

  const {
    hasValidationErrors, submitFailed, dirtySinceLastSubmit, pristine,
    submitting, validating,
  } = useFormState(subscription);

  if (formProps.readOnly) return null;

  disabled = formProps.disabled || disabled || submitting || validating ||
    hasValidationErrors && (submitFailed || dirtySinceLastSubmit)
    || (disablePristine && pristine);

  const Component = component ?? Button;
  return (
    <Component
      {...derivedProps}
      onClick={form.submit}
      disabled={disabled}
    />
  );
}

const MemoSubmitButton = React.memo(SubmitButton) as typeof SubmitButton;

export default MemoSubmitButton;
