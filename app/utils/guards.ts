export const isString = (value: unknown): value is string => "string" === typeof value;
export const isResponse = (value: unknown): value is Response => value instanceof Response;

export const isBrowser = (() =>
  // eslint-disable-next-line prefer-global-this
  "undefined" !== typeof window &&
  "undefined" !== typeof HTMLElement &&
  Boolean(globalThis.document) &&
  String(HTMLElement).includes("[native code]"))();
export const isServer = !isBrowser;
