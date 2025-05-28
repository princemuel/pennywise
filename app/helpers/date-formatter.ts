import { Temporal } from "@js-temporal/polyfill";

interface DateTimeFormatterOptions extends Partial<Intl.DateTimeFormatOptions> {
  locales?: Temporal.LocalesArgument;
}
type DateTimeValue = string | number | Date;

export class DateTimeFormatter {
  #locales: Temporal.LocalesArgument;
  #options: Intl.DateTimeFormatOptions;

  constructor(options: DateTimeFormatterOptions = {}) {
    const { locales = "en-US", ...formatOptions } = options;
    this.#locales = locales;
    this.#options = formatOptions;
  }

  #toZonedDateTime(value: DateTimeValue): Temporal.ZonedDateTime {
    if ("string" === typeof value || "number" === typeof value || value instanceof Date) {
      return Temporal.Instant.from(new Date(value).toISOString()).toZonedDateTimeISO(
        Temporal.Now.timeZoneId(),
      );
    }

    throw new TypeError("Invalid value type for date-time formatting");
  }

  format(value: DateTimeValue): string {
    const zonedDateTime = this.#toZonedDateTime(value);
    return zonedDateTime.toLocaleString(this.#locales, {
      year: "numeric",
      month: "long",
      day: "2-digit",
      ...this.#options,
    });
  }

  toISOString(value: DateTimeValue): string {
    const zonedDateTime = this.#toZonedDateTime(value);
    return zonedDateTime.withTimeZone("UTC").toString({ timeZoneName: "never" });
  }

  toCustomFormat(value: DateTimeValue, options: DateTimeFormatterOptions): string {
    const zonedDateTime = this.#toZonedDateTime(value);
    const { locales = this.#locales, ...customOptions } = options;
    return zonedDateTime.toLocaleString(locales, customOptions);
  }
}
