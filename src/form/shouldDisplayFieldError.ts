import { FieldState } from 'final-form';

function shouldDisplayFieldError<Value>(fieldState: FieldState<Value>) {
  const { touched, error, dirtySinceLastSubmit, submitError, submitFailed } = fieldState;
  return ((touched || submitFailed) && error && typeof error === 'string')
  || (!dirtySinceLastSubmit && submitError && typeof submitError === 'string');
}

export default shouldDisplayFieldError;
