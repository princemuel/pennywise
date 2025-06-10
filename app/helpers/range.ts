// oxlint-disable max-lines
export class Range {
  readonly #from: number;
  readonly #to: number;
  readonly #step: number;
  readonly #length: number;
  readonly #hash: string;

  constructor(from: number, to: number, step = 1) {
    if (!Number.isFinite(from) || !Number.isFinite(to) || !Number.isFinite(step)) {
      throw new TypeError("Range parameters must be finite numbers");
    }

    if (step === 0) throw new RangeError("Step cannot be zero");

    if ((to > from && step < 0) || (to < from && step > 0)) {
      throw new RangeError("Step direction must be compatible with range direction");
    }

    this.#from = from;
    this.#to = to;
    this.#step = step;

    // Pre-calculate length for O(1) access
    this.#length =
      step > 0
        ? Math.max(0, Math.floor((to - from) / step) + 1)
        : Math.max(0, Math.floor((from - to) / Math.abs(step)) + 1);

    // Pre-calculate hash for fast equality checks and Set/Map usage
    this.#hash = `${from}:${to}:${step}`;
  }

  get from(): number {
    return this.#from;
  }

  get to(): number {
    return this.#to;
  }

  get step(): number {
    return this.#step;
  }

  get length(): number {
    return this.#length;
  }

  get first(): number | undefined {
    return this.isEmpty ? undefined : this.#from;
  }

  get last(): number | undefined {
    return this.isEmpty ? undefined : this.#from + (this.#length - 1) * this.#step;
  }

  get min(): number {
    return Math.min(this.#from, this.#to);
  }

  get max(): number {
    return Math.max(this.#from, this.#to);
  }

  get sum(): number {
    if (this.isEmpty) return 0;
    // Arithmetic series sum: n/2 * (first + last)
    return (this.#length / 2) * (this.#from + this.last!);
  }

  get isEmpty(): boolean {
    return this.#length === 0;
  }

  get isAscending(): boolean {
    return this.#step > 0;
  }

  get isDescending(): boolean {
    return this.#step < 0;
  }

  get isContiguous(): boolean {
    return Math.abs(this.#step) === 1;
  }

  contains(element: number): boolean {
    return this.includes(element);
  }

  overlaps(other: Range): boolean {
    const thisMin = this.min;
    const thisMax = this.max;
    const otherMin = other.min;
    const otherMax = other.max;

    return thisMin <= otherMax && otherMin <= thisMax;
  }

  intersect(other: Range): Range | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const newFrom = Math.max(this.min, other.min);
    const newTo = Math.min(this.max, other.max);

    // Find compatible step (use GCD for different steps)
    const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
    const newStep = gcd(Math.abs(this.#step), Math.abs(other.#step));

    // Ensure the intersection starts at a valid point for both ranges
    let adjustedFrom = newFrom;
    while (
      adjustedFrom <= newTo &&
      (!this.includes(adjustedFrom) || !other.includes(adjustedFrom))
    ) {
      adjustedFrom += newStep;
    }

    return adjustedFrom <= newTo ? new Range(adjustedFrom, newTo, newStep) : null;
  }

  union(other: Range): Range | null {
    // Only works for contiguous or overlapping ranges with same step
    if (this.#step !== other.#step || (!this.overlaps(other) && !this.isAdjacent(other))) {
      return null;
    }

    const newFrom = Math.min(this.min, other.min);
    const newTo = Math.max(this.max, other.max);

    return new Range(newFrom, newTo, this.#step);
  }

  isAdjacent(other: Range): boolean {
    if (this.#step !== other.#step) return false;

    const thisLast = this.last!;
    const thisFirst = this.first!;
    const otherFirst = other.first!;
    const otherLast = other.last!;

    return (
      Math.abs(thisLast - otherFirst) === Math.abs(this.#step) ||
      Math.abs(otherLast - thisFirst) === Math.abs(this.#step)
    );
  }

  clamp(value: number): number {
    if (this.isEmpty) return value;
    return Math.max(this.min, Math.min(this.max, value));
  }

  includes(element: number): boolean {
    if (!Number.isFinite(element)) return false;

    if (this.#step > 0) {
      if (element < this.#from || element > this.#to) return false;
    } else if (element > this.#from || element < this.#to) {
      return false;
    }

    // Check if element aligns with step
    const offset = element - this.#from;
    return Math.abs(offset % this.#step) < Number.EPSILON;
  }

  find(predicate: (value: number, index: number) => boolean): number | undefined {
    let index = 0;
    for (const value of this) if (predicate(value, index++)) return value;
    return undefined;
  }

  findIndex(predicate: (value: number, index: number) => boolean): number {
    let index = 0;
    for (const value of this) {
      if (predicate(value, index)) return index;
      index++;
    }
    return -1;
  }

  take(count: number): Range {
    if (count <= 0) {
      return new Range(this.#from, this.#from - Math.abs(this.#step), this.#step);
    }

    const actualCount = Math.min(count, this.#length);
    const newTo = this.#from + (actualCount - 1) * this.#step;

    return new Range(this.#from, newTo, this.#step);
  }

  skip(count: number): Range {
    if (count <= 0) return this;
    if (count >= this.#length) {
      return new Range(this.#from, this.#from - Math.abs(this.#step), this.#step);
    }

    const newFrom = this.#from + count * this.#step;
    return new Range(newFrom, this.#to, this.#step);
  }

  chunk(size: number): Range[] {
    if (size <= 0) throw new RangeError("Chunk size must be positive");

    const chunks: Range[] = [];
    let current = this;

    while (!current.isEmpty) {
      const chunk = current.take(size);
      chunks.push(chunk);
      current = current.skip(size);
    }

    return chunks;
  }

  forEach(fn: (value: number, index: number) => void): void {
    let index = 0;
    for (const value of this) fn(value, index++);
  }

  at(index: number): number | undefined {
    if (!Number.isInteger(index)) return undefined;

    const actualIndex = index < 0 ? this.#length + index : index;

    if (actualIndex < 0 || actualIndex >= this.#length) {
      return undefined;
    }

    return this.#from + actualIndex * this.#step;
  }

  indexOf(element: number): number {
    if (!this.includes(element)) return -1;

    const index = Math.round((element - this.#from) / this.#step);
    return index >= 0 && index < this.#length ? index : -1;
  }

  slice(start = 0, end = this.#length): Range {
    const actualStart = Math.max(0, start < 0 ? this.#length + start : start);
    const actualEnd = Math.min(this.#length, end < 0 ? this.#length + end : end);

    if (actualStart >= actualEnd) {
      // Return empty range
      return new Range(this.#from, this.#from - Math.abs(this.#step), this.#step);
    }

    const newFrom = this.#from + actualStart * this.#step;
    const newTo = this.#from + (actualEnd - 1) * this.#step;

    return new Range(newFrom, newTo, this.#step);
  }

  reverse(): Range {
    if (this.isEmpty) return this;

    const lastValue = this.#from + (this.#length - 1) * this.#step;
    return new Range(lastValue, this.#from, -this.#step);
  }

  map<T>(fn: (value: number, index: number) => T): T[] {
    const result: T[] = [];
    let index = 0;

    for (const value of this) result.push(fn(value, index++));

    return result;
  }

  filter(predicate: (value: number, index: number) => boolean): number[] {
    const result: number[] = [];
    let index = 0;

    for (const value of this) {
      if (predicate(value, index++)) {
        result.push(value);
      }
    }

    return result;
  }

  reduce<T>(fn: (accumulator: T, value: number, index: number) => T, initialValue: T): T {
    let accumulator = initialValue;
    let index = 0;

    for (const value of this) {
      accumulator = fn(accumulator, value, index++);
    }

    return accumulator;
  }

  every(predicate: (value: number, index: number) => boolean): boolean {
    let index = 0;

    for (const value of this) if (!predicate(value, index++)) return false;

    return true;
  }

  some(predicate: (value: number, index: number) => boolean): boolean {
    let index = 0;

    for (const value of this) {
      if (predicate(value, index++)) return true;
    }

    return false;
  }

  toArray(): number[] {
    return [...this];
  }

  equals(other: Range): boolean {
    return this.#hash === other.#hash;
  }

  clone(): Range {
    return new Range(this.#from, this.#to, this.#step);
  }

  scale(factor: number): Range {
    if (!Number.isFinite(factor) || factor === 0) {
      throw new RangeError("Scale factor must be a non-zero finite number");
    }

    return new Range(this.#from * factor, this.#to * factor, this.#step * factor);
  }

  shift(offset: number): Range {
    if (!Number.isFinite(offset)) {
      throw new RangeError("Offset must be a finite number");
    }

    return new Range(this.#from + offset, this.#to + offset, this.#step);
  }

  // Symbol methods for better JS integration
  [Symbol.toPrimitive](hint: "number" | "string" | "default"): number | string {
    if (hint === "number") {
      return this.#length;
    }
    return this.toString();
  }

  [Symbol.toStringTag] = "Range";

  // Fast hash for Set/Map usage
  valueOf(): string {
    return this.#hash;
  }

  toString(): string {
    const stepStr = this.#step === 1 ? "" : `:${this.#step}`;
    return `Range(${this.#from}..${this.#to}${stepStr})`;
  }

  toJSON(): { from: number; to: number; step: number } {
    return { from: this.#from, to: this.#to, step: this.#step };
  }

  *[Symbol.iterator](): Generator<number, void, unknown> {
    if (this.#step > 0) {
      for (let value = this.#from; value <= this.#to; value += this.#step) yield value;
    } else {
      for (let value = this.#from; value >= this.#to; value += this.#step) yield value;
    }
  }

  // Static factory methods
  static fromArray(array: readonly number[]): Range {
    if (array.length === 0) throw new Error("Cannot create range from empty array");

    // @ts-expect-error cannot be undefined
    if (array.length === 1) return new Range(array[0], array[0]);

    // @ts-expect-error cannot be undefined
    const step = array[1] - array[0];

    // Validate it's actually a range
    for (let i = 2; i < array.length; i++) {
      // @ts-expect-error cannot be undefined
      if (Math.abs(array[i] - array[i - 1] - step) > Number.EPSILON) {
        throw new Error("Array does not represent a valid range (inconsistent step)");
      }
    }
    // @ts-expect-error cannot be undefined
    return new Range(array[0], array[array.length - 1], step);
  }

  static sequence(count: number, start = 0, step = 1): Range {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("Count must be a positive integer");
    }

    const end = start + (count - 1) * step;
    return new Range(start, end, step);
  }

  static inclusive(from: number, to: number, step = 1): Range {
    return new Range(from, to, step);
  }

  static exclusive(from: number, to: number, step = 1): Range {
    const adjustedTo = step > 0 ? to - step : to + Math.abs(step);
    return new Range(from, adjustedTo, step);
  }

  static merge(...ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];
    if (ranges.length === 1) return [...ranges];

    // Sort ranges by their minimum value
    const sorted = [...ranges].sort((a, b) => a.min - b.min);
    const merged: Range[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      const union = last.union(current);
      if (union) {
        merged[merged.length - 1] = union;
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  static overlap(...ranges: Range[]): Range | null {
    if (ranges.length === 0) return null;
    if (ranges.length === 1) return ranges[0];

    let intersection = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
      intersection = intersection.intersect(ranges[i]);
      if (!intersection) return null;
    }

    return intersection;
  }

  // Utility ranges
  static readonly EMPTY = new Range(0, -1, 1);
  static readonly ZERO_TO_ONE = new Range(0, 1, 1);
  static readonly NEGATIVE_ONE_TO_ONE = new Range(-1, 1, 1);
}
