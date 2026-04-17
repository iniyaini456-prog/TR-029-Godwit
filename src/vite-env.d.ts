/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string
  readonly VITE_ERP_API_BASE?: string
  readonly VITE_OPENWEATHER_API_KEY?: string
  readonly VITE_RAW_MATERIAL_API_KEY?: string
  readonly VITE_PORT_CLOSURE_API_KEY?: string
  readonly VITE_GEOPOLITICAL_API_KEY?: string
  readonly VITE_NEWS_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}