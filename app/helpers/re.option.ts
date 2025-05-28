import { Result } from "@/helpers/re.result";

/**
 * Represents an optional value: every `Option` is either `Some` and contains a value,
 * or `None`, and does not. This is a TypeScript port of Rust's `Option<T>`.
 *
 * Use `Option` to model values that may be absent, instead of relying on `null` or `undefined`.
 */
export class Option<T> implements Iterable<T> {
  private readonly _value: T | null;
  private readonly _isSome: boolean;

  private constructor(value: T | null, isSome: boolean) {
    this._value = value;
    this._isSome = isSome;
  }

  /**
   * Constructs a `Some` variant containing a value.
   *
   * @throws If the value is `null` or `undefined`.
   */
  static Some<T>(value: T): Option<T> {
    if (null === value || undefined === value)
      throw new Error("Cannot create Some with null or undefined");
    return new Option<T>(value, true);
  }

  /**
   * Constructs a `None` variant (no value).
   */
  static None<T>(): Option<T> {
    return new Option<T>(null, false);
  }

  /**
   * Returns `true` if the option is a `Some` value.
   */
  isSome(): boolean {
    return this._isSome;
  }

  /**
   * Returns `true` if the option is a `None` value.
   */
  isNone(): boolean {
    return !this._isSome;
  }

  /**
   * Returns the contained `Some` value.
   *
   * @throws If the value is `None`.
   */
  unwrap(): T {
    if (this._isSome) return this._value as T;
    throw new Error("Called unwrap on a None value");
  }

  /**
   * Like `unwrap`, but throws with a custom message if `None`.
   * @throws If the value is `None`.
   */
  expect(message: string): T {
    if (this._isSome) return this._value as T;
    throw new Error(message);
  }

  /**
   * Returns the contained value or a provided default.
   */
  unwrapOr(defaultValue: T): T {
    return this._isSome ? (this._value as T) : defaultValue;
  }

  /**
   * Returns the contained value or computes it from a closure.
   */
  unwrapOrElse(fn: () => T): T {
    return this._isSome ? (this._value as T) : fn();
  }

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function to the contained value.
   */
  map<U>(fn: (value: T) => U): Option<U> {
    return this._isSome ? Option.Some(fn(this._value as T)) : Option.None<U>();
  }

  /**
   * Applies a function to the contained value (if any), or returns the default value.
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this._isSome ? fn(this._value as T) : defaultValue;
  }

  /**
   * Applies one of two functions based on the variant: `fn` if `Some`, `defaultFn` if `None`.
   */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
    return this._isSome ? fn(this._value as T) : defaultFn();
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `fn` with the contained value
   * and returns the result.
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return this._isSome ? fn(this._value as T) : Option.None<U>();
  }

  /**
   * Returns the option if it contains a value, otherwise returns `other`.
   */
  or(other: Option<T>): Option<T> {
    return this._isSome ? this : other;
  }

  /**
   * Returns the option if it contains a value, otherwise calls `fn` and returns its result.
   */
  orElse(fn: () => Option<T>): Option<T> {
    return this._isSome ? this : fn();
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `predicate` with the contained value
   * and returns:
   * - `Some(value)` if predicate returns `true`
   * - `None` otherwise
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    return this._isSome && predicate(this._value as T) ? this : Option.None<T>();
  }

  /**
   * Applies a function to the contained value if `Some`, otherwise calls `onNone`.
   * Returns the result of whichever function is called.
   */
  match<U>(onSome: (value: T) => U, onNone: () => U): U {
    return this._isSome ? onSome(this._value as T) : onNone();
  }

  /**
   * Converts from `Option<T>` to `Result<T, E>`, mapping:
   * - `Some(v)` => `Ok(v)`
   * - `None` => `Err(err)`
   */
  okOr<E>(err: E): Result<T, E> {
    return this._isSome ? Result.Ok<T, E>(this._value as T) : Result.Err<T, E>(err);
  }

  /**
   * Converts from `Option<T>` to `Result<T, E>`, mapping:
   * - `Some(v)` => `Ok(v)`
   * - `None` => `Err(fn())`
   */
  okOrElse<E>(errFn: () => E): Result<T, E> {
    return this._isSome ? Result.Ok<T, E>(this._value as T) : Result.Err<T, E>(errFn());
  }

  /**
   * Converts a nullable value (null or undefined) into an Option.
   * Returns Some(value) if not null/undefined, otherwise None.
   */
  static fromNullable<T>(value: T | null | undefined): Option<T> {
    return null !== value && undefined !== value ? Option.Some(value) : Option.None<T>();
  }

  /**
   * Converts an Option<T> into a nullable value (T | null).
   * - Some(value) => value
   * - None => null
   */
  toNullable(): T | null {
    return this._isSome ? (this._value as T) : null;
  }

  /**
   * Converts an Option<T> into an undefined value (T | undefined).
   * - Some(value) => value
   * - None => undefined
   */
  toUndefined(): T | undefined {
    return this._isSome ? (this._value as T) : undefined;
  }

  toJSON(): string {
    return JSON.stringify(this._isSome ? this._value : null);
  }

  toString(): string {
    return this._isSome ? `Some(${String(this._value)})` : "None";
  }

  /**
   * Makes `Option<T>` iterable (so it works with `for..of`, spreads, etc).
   */
  *[Symbol.iterator](): Iterator<T> {
    if (this._isSome) yield this._value as T;
  }
}
