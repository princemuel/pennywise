/* eslint-disable no-var */
declare namespace globalThis {
  interface ObjectConstructor {
    entries<T extends NonNullable<unknown>>(object: T): readonly Entry<T>[];
  }
  var __singletons__: Map<string, unknown> | undefined;
  var ThemeProvider: { selectThemeIcon(theme?: string): void };
}
