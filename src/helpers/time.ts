export const secs = (item: Temporal.DurationLike) => Temporal.Duration.from(item).total('seconds');
export const stripTz = (datetime: string) =>
	datetime.replace(/([+-]\d{2}:\d{2})?(\[.*?\])?Z?$/, '');
