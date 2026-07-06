/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ANIMATION_CATALOG_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
