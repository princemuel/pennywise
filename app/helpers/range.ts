// oxlint-disable max-lines
// A proper Range implementation following Python/Rust conventions
export class Range {
  readonly #start: number;
  readonly #stop: number;
  readonly #step: number;
  readonly #length: number;
  readonly #hash: string;
  #string?: string;

  // Constructor follows Python range(start, stop, step) - stop is exclusive
  constructor(start: number, stop: number, step = 1) {
    if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step)) {
      throw new TypeError("Range parameters must be finite numbers");
    }

    if (step === 0) throw new RangeError("Step cannot be zero");

    this.#start = start;
    this.#stop = stop;
    this.#step = step;

    // Calculate length based on exclusive stop
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      this.#length = 0;
    } else if (step > 0) {
      this.#length = Math.floor((stop - start + step - 1) / step);
    } else {
      this.#length = Math.floor((start - stop - step - 1) / -step);
    }

    // Pre-calculate hash for fast equality checks and Set/Map usage
    this.#hash = `${start}:${stop}:${step}`;
  }

  // Alternative constructor for single argument (like Python range(n))
  static count(stop: number): Range {
    return new Range(0, stop, 1);
  }

  // Inclusive range constructor for when you want [start, end]
  static inclusive(start: number, end: number, step = 1): Range {
    const stop = step > 0 ? end + step : end - Math.abs(step);
    return new Range(start, stop, step);
  }

  get start(): number {
    return this.#start;
  }

  get stop(): number {
    return this.#stop;
  }

  get step(): number {
    return this.#step;
  }

  get length(): number {
    return this.#length;
  }

  get first(): number | undefined {
    return this.isEmpty ? undefined : this.#start;
  }

  get last(): number | undefined {
    return this.isEmpty ? undefined : this.#start + (this.#length - 1) * this.#step;
  }

  get min(): number {
    if (this.isEmpty) return this.#start;
    const lastValue = this.#start + (this.#length - 1) * this.#step;
    return Math.min(this.#start, lastValue);
  }

  get max(): number {
    if (this.isEmpty) return this.#start;
    const lastValue = this.#start + (this.#length - 1) * this.#step;
    return Math.max(this.#start, lastValue);
  }

  get sum(): number {
    if (this.isEmpty) return 0;
    // Arithmetic series sum: n/2 * (first + last)
    const lastValue = this.#start + (this.#length - 1) * this.#step;
    return (this.#length / 2) * (this.#start + lastValue);
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

  includes(element: number): boolean {
    if (!Number.isFinite(element)) return false;
    if (this.isEmpty) return false;

    // Check bounds based on step direction
    if (this.#step > 0) {
      if (element < this.#start || element >= this.#stop) return false;
    } else if (element > this.#start || element <= this.#stop) {
      return false;
    }

    // Check if element aligns with step
    const offset = element - this.#start;
    return Number.isInteger(offset / this.#step);
  }

  overlaps(other: Range): boolean {
    if (this.isEmpty || other.isEmpty) return false;

    const thisMin = this.min;
    const thisMax = this.max;
    const otherMin = other.min;
    const otherMax = other.max;

    return thisMin <= otherMax && otherMin <= thisMax;
  }

  intersect(other: Range): Range | undefined {
    if (!this.overlaps(other)) return undefined;

    // For different steps, we need to find common values
    if (this.#step !== other.#step) {
      // This is complex - for now, return undefined for different steps
      // Full implementation would require Extended Euclidean Algorithm
      return undefined;
    }

    // Same step case
    const newStart = Math.max(this.#start, other.#start);
    const newStop = Math.min(this.#stop, other.#stop);

    // Align start to step boundaries
    const thisOffset = (newStart - this.#start) % this.#step;
    const otherOffset = (newStart - other.#start) % other.#step;

    if (thisOffset !== otherOffset) {
      // Need to find the next aligned position
      const alignedStart = newStart + (this.#step - Math.max(thisOffset, otherOffset));
      return alignedStart < newStop ? new Range(alignedStart, newStop, this.#step) : undefined;
    }

    return newStart < newStop ? new Range(newStart, newStop, this.#step) : undefined;
  }

  union(other: Range): Range | undefined {
    // Only works for same step and compatible ranges
    if (this.#step !== other.#step) return undefined;
    if (!this.overlaps(other) && !this.isAdjacent(other)) return undefined;

    const newStart = Math.min(this.#start, other.#start);
    const newStop = Math.max(this.#stop, other.#stop);

    return new Range(newStart, newStop, this.#step);
  }

  isAdjacent(other: Range): boolean {
    if (this.#step !== other.#step || this.isEmpty || other.isEmpty) return false;

    // Check if ranges are adjacent (one ends where the other begins)
    return this.#stop === other.#start || other.#stop === this.#start;
  }

  clamp(value: number): number {
    if (this.isEmpty) return value;
    return Math.max(this.min, Math.min(this.max, value));
  }

  find(predicate: (value: number, index: number) => boolean): number | undefined {
    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) return value;
    }
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
    if (count <= 0 || this.isEmpty) {
      return Range.empty();
    }

    const actualCount = Math.min(count, this.#length);
    const newStop = this.#start + actualCount * this.#step;

    return new Range(this.#start, newStop, this.#step);
  }

  skip(count: number): Range {
    if (count <= 0) return this;
    if (count >= this.#length) return Range.empty();

    const newStart = this.#start + count * this.#step;
    return new Range(newStart, this.#stop, this.#step);
  }

  chunk(size: number): Range[] {
    if (size <= 0) throw new RangeError("Chunk size must be positive");
    const chunks: Range[] = [];

    for (let current = this as Range; !current.isEmpty; current = current.skip(size)) {
      chunks.push(current.take(size));
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

    if (actualIndex < 0 || actualIndex >= this.#length) return undefined;

    return this.#start + actualIndex * this.#step;
  }

  indexOf(element: number): number {
    if (!this.includes(element)) return -1;

    const index = Math.round((element - this.#start) / this.#step);
    return index >= 0 && index < this.#length ? index : -1;
  }

  slice(start = 0, end = this.#length): Range {
    const actualStart = Math.max(0, start < 0 ? this.#length + start : start);
    const actualEnd = Math.min(this.#length, end < 0 ? this.#length + end : end);

    if (actualStart >= actualEnd) {
      return Range.empty();
    }

    const newStart = this.#start + actualStart * this.#step;
    const newStop = this.#start + actualEnd * this.#step;

    return new Range(newStart, newStop, this.#step);
  }

  reverse(): Range {
    if (this.isEmpty) return this;

    const lastValue = this.#start + (this.#length - 1) * this.#step;
    const newStop = this.#start - this.#step;

    return new Range(lastValue, newStop, -this.#step);
  }

  map<T>(fn: (value: number, index: number) => T): T[] {
    const result = Array.from<T>({ length: this.#length });
    let index = 0;

    for (const value of this) {
      result[index] = fn(value, index);
      index++;
    }

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

    for (const value of this) {
      if (!predicate(value, index++)) return false;
    }

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
    const result = Array.from<number>({ length: this.#length });
    let index = 0;

    for (const value of this) {
      result[index++] = value;
    }

    return result;
  }

  equals(other: Range): boolean {
    // this.#start === other.#start && this.#stop === other.#stop && this.#step === other.#step
    return this.#hash === other.#hash;
  }

  clone(): Range {
    return new Range(this.#start, this.#stop, this.#step);
  }

  scale(factor: number): Range {
    if (!Number.isFinite(factor) || factor === 0) {
      throw new RangeError("Scale factor must be a non-zero finite number");
    }

    return new Range(this.#start * factor, this.#stop * factor, this.#step * factor);
  }

  shift(offset: number): Range {
    if (!Number.isFinite(offset)) {
      throw new RangeError("Offset must be a finite number");
    }

    return new Range(this.#start + offset, this.#stop + offset, this.#step);
  }

  // Symbol methods for better JS integration
  [Symbol.toPrimitive](hint: "number" | "string" | "default"): number | string {
    if (hint === "number") return this.#length;
    if (hint === "default") return this.#length; // More intuitive for comparisons
    return this.#hash;
  }

  [Symbol.toStringTag] = "Range";

  // Use hash for Set/Map identity
  valueOf(): string {
    return this.#hash;
  }

  toString(): string {
    if (this.#string) return this.#string;

    this.#string =
      this.#step === 1
        ? `Range(${this.#start}, ${this.#stop})`
        : `Range(${this.#start}, ${this.#stop}, ${this.#step})`;

    return this.#string;
  }

  toJSON(): { start: number; stop: number; step: number; length: number } {
    return {
      start: this.#start,
      stop: this.#stop,
      step: this.#step,
      length: this.#length,
    };
  }

  *[Symbol.iterator](): Generator<number, void, void> {
    // Prevent infinite loops
    if (this.#step === 0 || this.isEmpty) return;

    if (this.#step > 0) {
      for (let value = this.#start; value < this.#stop; value += this.#step) {
        yield value;
      }
    } else {
      for (let value = this.#start; value > this.#stop; value += this.#step) {
        yield value;
      }
    }
  }

  // Static factory methods
  static fromArray(array: readonly number[]): Range {
    if (array.length === 0) throw new Error("Cannot create range from empty array");

    if (array.length === 1) {
      return new Range(array[0]!, array[0]! + 1); // Single element range
    }

    const step = array[1]! - array[0]!;

    // Validate it's actually a valid sequence
    for (let i = 2; i < array.length; i++) {
      if (Math.abs(array[i]! - array[i - 1]! - step) > Number.EPSILON) {
        throw new Error("Array does not represent a valid range (inconsistent step)");
      }
    }

    // Calculate stop as exclusive bound
    const stop = array[array.length - 1]! + step;
    return new Range(array[0]!, stop, step);
  }

  static sequence(count: number, start = 0, step = 1): Range {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError("Count must be a non-negative integer");
    }

    const stop = start + count * step;
    return new Range(start, stop, step);
  }

  static empty(): Range {
    return new Range(0, 0, 1);
  }

  static merge(...ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];
    if (ranges.length === 1) return [...ranges];

    // Sort ranges by their start value
    const sorted = [...ranges].sort((a, b) => a.#start - b.#start);
    const merged: Range[] = [sorted[0]!];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]!;
      const last = merged[merged.length - 1]!;

      const union = last.union(current);
      if (union) merged[merged.length - 1] = union;
      else merged.push(current);
    }

    return merged;
  }

  static overlap(...ranges: Range[]): Range | undefined {
    if (ranges.length === 0) return undefined;
    if (ranges.length === 1) return ranges[0]!;

    let intersection = ranges[0]!;
    for (let i = 1; i < ranges.length; i++) {
      const nextIntersection = intersection.intersect(ranges[i]!);
      if (!nextIntersection) return undefined;
      intersection = nextIntersection;
    }

    return intersection;
  }

  // Common utility ranges
  static readonly EMPTY = Range.empty();
  static readonly ZERO_TO_TEN = new Range(0, 10, 1); // [0, 1, 2, ..., 9]
  static readonly ONE_TO_TEN = new Range(1, 11, 1); // [1, 2, 3, ..., 10]
}
