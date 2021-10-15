function toggleValueInArray<T = unknown>(valueArray: T[], value: T) {
  if (!(valueArray instanceof Array)) valueArray = [];

  if (!valueArray.includes(value)) return [...valueArray, value];

  const currentOptionIndex = valueArray.indexOf(value);
  return [
    ...valueArray.slice(0, currentOptionIndex),
    ...valueArray.slice(currentOptionIndex + 1),
  ];
}

export default toggleValueInArray;
