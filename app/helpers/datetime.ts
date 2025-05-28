import { Temporal } from "@js-temporal/polyfill";

if ("undefined" === typeof Temporal) {
  console.warn("Temporal API not detected. Please ensure the polyfill is loaded.");
}

/**
 * DatetimeFormatter - A comprehensive utility class for date/time operations
 * using the Temporal API. Provides conversions between different
 * date formats with internationalization support. It will work with both
 * the polyfill and native implementation
 */
class DatetimeFormatter {
  #locales: Temporal.LocalesArgument;
  #timeZone: string;

  /**
   * Creates a new DatetimeFormatter instance
   * @param locale - The locale to use for formatting (default: 'en-US')
   * @param timeZone - The time zone to use (default: system's local time zone)
   */
  constructor(locales = "en-US", timeZone?: string) {
    this.#locales = locales;

    // Handle both polyfill and native implementation
    if (timeZone) {
      this.#timeZone = timeZone;
    } else {
      try {
        // Try native API first
        this.#timeZone = Temporal.Now.timeZoneId();
      } catch {
        // Fallback to system timezone if neither works
        this.#timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
    }
  }

  // Rest of methods remain mostly the same, with feature detection
  // where necessary to handle API differences

  /**
   * Convert legacy Date object to Temporal.ZonedDateTime
   */
  fromDate(date: Date): Temporal.ZonedDateTime {
    return Temporal.ZonedDateTime.from({
      timeZone: this.#timeZone,
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Date months are 0-indexed, Temporal months are 1-indexed
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    });
  }

  /**
   * Convert Temporal.ZonedDateTime to legacy Date object
   */
  toDate(zonedDateTime: Temporal.ZonedDateTime): Date {
    return new Date(zonedDateTime.epochMilliseconds);
  }

  /**
   * Parse an ISO string to Temporal.ZonedDateTime
   */
  fromISOString(isoString: string): Temporal.ZonedDateTime {
    try {
      // If the ISO string includes a time zone
      return Temporal.ZonedDateTime.from(isoString);
    } catch {
      // If it's just a date or doesn't have time zone info, add the current time zone
      try {
        const instant = Temporal.Instant.from(isoString);
        return instant.toZonedDateTimeISO(this.#timeZone);
      } catch {
        // For date-only strings, add time and time zone
        const plainDate = Temporal.PlainDate.from(isoString);
        return plainDate.toZonedDateTime({
          timeZone: this.#timeZone,
          plainTime: new Temporal.PlainTime(0, 0),
        });
      }
    }
  }

  /**
   * Convert Temporal.ZonedDateTime to ISO string
   */
  toISOString(zonedDateTime: Temporal.ZonedDateTime): string {
    return zonedDateTime.toString();
  }

  /**
   * Parse a date string in various formats to Temporal.ZonedDateTime
   * @param dateString - Date string in various formats (e.g., '2023-05-15', 'May 15, 2023')
   */
  fromString(dateString: string): Temporal.ZonedDateTime {
    try {
      // Try parsing with Temporal first
      return this.fromISOString(dateString);
    } catch {
      // Fallback to Date's parser for other formats, then convert
      const date = new Date(dateString);
      if (isNaN(date.getTime()))
        throw new TypeError(`Unable to parse date string: ${dateString}`);

      return this.fromDate(date);
    }
  }

  /**
   * Format a Temporal.ZonedDateTime to a localized string
   * @param zonedDateTime - The Temporal.ZonedDateTime to format
   * @param options - Intl.DateTimeFormatOptions for formatting
   */
  format(zonedDateTime: Temporal.ZonedDateTime, options: Intl.DateTimeFormatOptions = {}) {
    return zonedDateTime.toLocaleString(this.#locales, options);
  }

  /**
   * Get the current date and time as Temporal.ZonedDateTime
   */
  now(): Temporal.ZonedDateTime {
    // This approach handles both polyfill and native implementation
    return Temporal.Now.zonedDateTimeISO(this.#timeZone);
  }

  /**
   * Format the current date and time
   * @param options - Intl.DateTimeFormatOptions for formatting
   */
  formatNow(options?: Intl.DateTimeFormatOptions): string {
    return this.format(this.now(), options);
  }

  /**
   * Format a Date object
   * @param date - JavaScript Date object
   * @param options - Intl.DateTimeFormatOptions for formatting
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return this.format(this.fromDate(date), options);
  }

  /**
   * Format a date string
   * @param dateString - Date string in various formats
   * @param options - Intl.DateTimeFormatOptions for formatting
   */
  formatString(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    return this.format(this.fromString(dateString), options);
  }

  /**
   * Format a date as a relative time (e.g., "2 days ago", "in 3 hours")
   * @param zonedDateTime - The Temporal.ZonedDateTime to format
   */
  formatRelative(zonedDateTime: Temporal.ZonedDateTime): string {
    const now = this.now();
    const diffInSeconds = Math.floor(
      0 >
        Temporal.Duration.compare(
          now.since(zonedDateTime),
          Temporal.Duration.from({ seconds: 0 }),
        )
        ? zonedDateTime.since(now).total({ unit: "second" })
        : now.since(zonedDateTime).total({ unit: "second" }),
    );

    const future =
      0 >
      Temporal.Duration.compare(
        now.since(zonedDateTime),
        Temporal.Duration.from({ seconds: 0 }),
      );

    const rtf = new Intl.RelativeTimeFormat(this.#locales, { numeric: "auto" });

    if (60 > diffInSeconds) {
      return rtf.format(future ? diffInSeconds : -diffInSeconds, "second");
    }

    if (3600 > diffInSeconds) {
      return rtf.format(
        future ? Math.floor(diffInSeconds / 60) : -Math.floor(diffInSeconds / 60),
        "minute",
      );
    }

    if (86_400 > diffInSeconds) {
      return rtf.format(
        future ? Math.floor(diffInSeconds / 3600) : -Math.floor(diffInSeconds / 3600),
        "hour",
      );
    }

    if (2_592_000 > diffInSeconds) {
      // ~30 days
      return rtf.format(
        future ? Math.floor(diffInSeconds / 86_400) : -Math.floor(diffInSeconds / 86_400),
        "day",
      );
    }

    if (31_536_000 > diffInSeconds) {
      // ~365 days
      return rtf.format(
        future ? Math.floor(diffInSeconds / 2_592_000) : -Math.floor(diffInSeconds / 2_592_000),
        "month",
      );
    }

    return rtf.format(
      future ? Math.floor(diffInSeconds / 31_536_000) : -Math.floor(diffInSeconds / 31_536_000),
      "year",
    );
  }

  /**
   * Change the locale of the formatter
   * @param locale - The new locale string
   */
  setLocale(locale: string): void {
    this.#locales = locale;
  }

  /**
   * Change the time zone of the formatter
   * @param timeZone - The new time zone string
   */
  setTimeZone(timeZone: string): void {
    this.#timeZone = timeZone;
  }

  /**
   * Check if a string is a valid date
   * @param dateString - The string to validate
   */
  isValidDate(dateString: string): boolean {
    try {
      this.fromString(dateString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add a duration to a ZonedDateTime
   * @param zonedDateTime - The base date/time
   * @param duration - Duration to add (object or string)
   */
  add(
    zonedDateTime: Temporal.ZonedDateTime,
    duration: Temporal.DurationLike,
  ): Temporal.ZonedDateTime {
    return zonedDateTime.add(duration);
  }

  /**
   * Subtract a duration from a ZonedDateTime
   * @param zonedDateTime - The base date/time
   * @param duration - Duration to subtract (object or string)
   */
  subtract(
    zonedDateTime: Temporal.ZonedDateTime,
    duration: Temporal.DurationLike,
  ): Temporal.ZonedDateTime {
    return zonedDateTime.subtract(duration);
  }

  /**
   * Get the difference between two dates as a Temporal.Duration
   */
  difference(
    start: Temporal.ZonedDateTime,
    end: Temporal.ZonedDateTime,
    largestUnit: Temporal.PluralUnit<Temporal.DateTimeUnit> = "days",
  ): Temporal.Duration {
    return start.until(end, { largestUnit });
  }

  /**
   * Format a date for blog display
   * @param date - Date to format (ZonedDateTime, Date, or string)
   */
  formatBlogDate(
    date: Temporal.ZonedDateTime | Date | string,
    options: Intl.DateTimeFormatOptions = {},
  ): string {
    const opts = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    } satisfies Intl.DateTimeFormatOptions;

    let zonedDateTime: Temporal.ZonedDateTime | null = null;

    if (date instanceof Date) {
      zonedDateTime = this.fromDate(date);
    } else if ("string" === typeof date) {
      zonedDateTime = this.fromString(date);
    } else {
      zonedDateTime = date;
    }

    return this.format(zonedDateTime, opts);
  }
}

const formatter = new DatetimeFormatter();
const now = formatter.now();
console.log(formatter.format(now));
console.log(formatter.formatRelative(now.subtract({ days: 2 })));
console.log(formatter.formatBlogDate("2023-05-15"));
