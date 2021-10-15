export function name(value) {
  if (!value) return 'Is required';
  if (value.length < 3) return 'Should be no less then 3 symbols';
}

export function gender(value: string) {
  if (!value) return 'You must explicitly specify gender';
}

export function badHabbits(values: string[]) {
  if (values?.length >= 1) return;
  return 'You must choose at least 1 bad habbit';
}

export function wishlist(values: string[]) {
  if (!values) return;
  const wishes = new Map<string, number>();
  let errors = [];
  if (values?.length < 3) errors[ARRAY_ERROR] = 'You must specify at least 3 wishes';
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!wishes.has(value)) wishes.set(value, i);
    else {
      errors[i] = 'Dublicate wish';
      errors[wishes.get(value)] = 'Dublicate wish';
    }
  }
  return errors;
}