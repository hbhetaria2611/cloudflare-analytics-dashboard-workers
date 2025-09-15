/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDFLARE_ZONE_ID: string
  readonly VITE_CLOUDFLARE_API_TOKEN: string
  readonly VITE_CLOUDFLARE_EMAIL: string
  readonly VITE_WORKER_URL: string
  readonly VITE_ALLOWED_HOSTS: string
  readonly VITE_PORT: string
  readonly VITE_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}