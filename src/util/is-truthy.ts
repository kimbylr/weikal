export const isTruthy = <T>(value: T | undefined | null | false | 0): value is T =>
  !!value;
