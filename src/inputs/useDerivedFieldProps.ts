import { useFormProps } from 'form';
import { classes } from 'utils';

interface DerivedFieldProps {
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

function useDerivedFieldProps({ disabled, readOnly, className, ...props }: DerivedFieldProps) {

  const formProps = useFormProps();

  disabled = formProps.disabled || disabled;
  readOnly = formProps.readOnly || readOnly;
  className = classes(
    readOnly ? 'readonly' : undefined,
    className
  );

  return {
    ...props,
    disabled: disabled || readOnly,
    readOnly,
    className,
  };
}

export default useDerivedFieldProps;
