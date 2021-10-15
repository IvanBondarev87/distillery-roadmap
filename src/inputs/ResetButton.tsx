import { Button, ButtonProps } from '@material-ui/core';
import { useForm, useFormState, useFormProps, FormSubscription } from 'form';
import { classes } from 'utils';

interface ResetButtonProps extends Omit<ButtonProps, 'children'> {
  label?: string;
  icon?: ReactNode;
}

const subscription: FormSubscription = {
  pristine: true,
  submitting: true,
};

function ResetButton({ label = 'Очистить', icon, className, disabled, ...props }: ResetButtonProps) {

  const formProps = useFormProps();

  const { pristine, submitting } = useFormState(subscription);
  const form = useForm();

  if (formProps.readOnly) return null;

  return (
    <Button
      className={classes(className)}
      disabled={disabled || pristine || submitting}
      onClick={() => form.reset()}
      {...props}
    >
      {icon}
      {label}
    </Button>
  );
}

export default React.memo(ResetButton);
