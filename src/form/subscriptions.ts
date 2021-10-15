import { FieldSubscription } from 'final-form';

export const inputSubscription: FieldSubscription = {
  value: true,
  dirty: true,
};

export const errorSubscription: FieldSubscription = {
  touched: true,
  error: true,
  submitError: true,
  dirtySinceLastSubmit: true,
  submitFailed: true,
};

export const fieldSubscription: FieldSubscription = {
  ...inputSubscription,
  ...errorSubscription,
};
