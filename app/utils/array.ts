export const hasValues = <T>(value: T[] | undefined | null): value is NonNullable<T[]> => {
  // eslint-disable-next-line explicit-length-check
  return Array.isArray(value) && 0 < value.length;
};

export const hasValue = <T>(value: T | undefined | null): value is NonNullable<T> => {
  return value !== undefined && null !== value && "" !== value && false !== value;
};
