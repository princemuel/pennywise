/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface globalThis {
  __singletons: Map<string, unknown>;
}
