/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly db_url?: string;
  readonly anon?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
