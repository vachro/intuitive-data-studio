/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SANITY_STUDIO_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
