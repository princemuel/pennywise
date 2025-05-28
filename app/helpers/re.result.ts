import { Option } from "@/helpers/re.option";

/**
 * A type that represents either success (`Ok`) or failure (`Err`).
 * Inspired by Rust's `Result<T, E>`, this class is useful for safe, explicit error handling.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 */
export class Result<T, E> {
  private readonly _value: T | E;
  private readonly _isOk: boolean;

  private constructor(value: T | E, isOk: boolean) {
    this._value = value;
    this._isOk = isOk;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructors
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Creates a successful Result wrapping a value of type T.
   * @param value - The successful value.
   */
  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, true);
  }

  /**
   * Creates a failed Result wrapping an error of type E.
   * @param error - The error value.
   */

  static Err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(error, false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Status Checks
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Returns true if the result is Ok.
   */
  isOk(): boolean {
    return this._isOk;
  }

  /**
   * Returns true if the result is Err.
   */
  isErr(): boolean {
    return !this._isOk;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Unwrap Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Returns the wrapped value if Ok, otherwise throws an error.
   * @throws Error if the result is Err.
   */
  unwrap(): T {
    if (this._isOk) return this._value as T;
    throw new Error(`Called unwrap on an Err value: ${this._value}`);
  }

  /**
   * Returns the wrapped value if Ok, otherwise returns the provided default.
   * @param defaultValue - Fallback value if result is Err.
   */
  unwrapOr(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue;
  }

  /**
   * Returns the wrapped value if Ok, otherwise computes a fallback from the error.
   * @param fn - Function that maps the error to a fallback value.
   */
  unwrapOrElse(fn: (err: E) => T): T {
    return this._isOk ? (this._value as T) : fn(this._value as E);
  }

  /**
   * Returns the wrapped error if Err, otherwise throws.
   * @throws Error if the result is Ok.
   */
  unwrapErr(): E {
    if (!this._isOk) return this._value as E;
    throw new Error("Called unwrapErr on an Ok value");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Transformation
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Maps an Ok value to a new Result using the provided function.
   * If Err, returns the original error.
   * @param fn - Function to transform the Ok value.
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._isOk
      ? Result.Ok<U, E>(fn(this._value as T))
      : Result.Err<U, E>(this._value as E);
  }

  /**
   * Maps an Ok value to a new value or returns the default.
   * @param defaultValue - Fallback value if Err.
   * @param fn - Mapping function for Ok value.
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this._isOk ? fn(this._value as T) : defaultValue;
  }

  /**
   * Maps an Ok value or maps an Err to a fallback using functions.
   * @param defaultFn - Mapping function for Err.
   * @param fn - Mapping function for Ok.
   */
  mapOrElse<U>(defaultFn: (err: E) => U, fn: (value: T) => U): U {
    return this._isOk ? fn(this._value as T) : defaultFn(this._value as E);
  }

  /**
   * Maps an Err to a new Result. If Ok, value is unchanged.
   * @param fn - Mapping function for Err value.
   */
  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return this._isOk
      ? Result.Ok<T, F>(this._value as T)
      : Result.Err<T, F>(fn(this._value as E));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Chaining
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Chains the Result with another computation if Ok.
   * Equivalent to Rust’s `and_then`.
   * @param fn - Function that returns a new Result.
   */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._isOk ? fn(this._value as T) : Result.Err<U, E>(this._value as E);
  }

  /**
   * If the result is Ok, returns self. If Err, returns the provided fallback Result.
   * @param res - Fallback Result if Err.
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    return this._isOk ? Result.Ok<T, F>(this._value as T) : res;
  }

  /**
   * If the result is Ok, returns self. If Err, calls `fn` and returns the result.
   * @param fn - Function to produce a fallback Result from error.
   */
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return this._isOk ? Result.Ok<T, F>(this._value as T) : fn(this._value as E);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Pattern Matching
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Exhaustively handles both Ok and Err cases.
   * @param onOk - Handler for Ok value.
   * @param onErr - Handler for Err value.
   */
  match<U>(onOk: (value: T) => U, onErr: (err: E) => U): U {
    return this._isOk ? onOk(this._value as T) : onErr(this._value as E);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Option Conversions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Converts the Result to an Option, discarding the Err value.
   */
  ok(): Option<T> {
    return this._isOk ? Option.Some<T>(this._value as T) : Option.None<T>();
  }

  /**
   * Converts the Result to an Option, discarding the Ok value.
   */
  err(): Option<E> {
    return this._isOk ? Option.None<E>() : Option.Some<E>(this._value as E);
  }

  /**
   * Safely evaluates a function and wraps the result in a Result.
   * Returns Ok(value) if successful, Err(error) if exception is thrown.
   */
  static attempt<T, E = unknown>(fn: () => T): Result<T, E> {
    try {
      return Result.Ok(fn());
    } catch (error) {
      return Result.Err(error as E);
    }
  }
  /**
   * Asynchronous version of attempt. Wraps a Promise-returning function.
   */
  static async fromAsync<T, E = unknown>(fn: () => Promise<T>): Promise<Result<T, E>> {
    try {
      return Result.Ok(await fn());
    } catch (error) {
      return Result.Err(error as E);
    }
  }
}
