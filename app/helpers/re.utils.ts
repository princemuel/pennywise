import type { Option } from "@/helpers/re.option";

/**
 * Converts an Option<T> into a nullable value (T | null).
 * - Some(value) => value
 * - None => null
 */
export const toNullable = <T>(value: Option<T>): T | null =>
  value.isSome() ? value.unwrap() : null;

/**
 * Converts an Option<T> into an undefined value (T | undefined).
 * - Some(value) => value
 * - None => undefined
 */
export const toUndefined = <T>(value: Option<T>): T | undefined =>
  value.isSome() ? value.unwrap() : undefined;
