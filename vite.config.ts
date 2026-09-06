import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { boothServerPlugin } from './src/server/plugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.db_url || env.DB_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnon = env.anon || env.ANON || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';
  const adminPin = env.ADMIN_PIN || '1337';

  return {
    define: {
      'import.meta.env.db_url': JSON.stringify(supabaseUrl),
      'import.meta.env.anon': JSON.stringify(supabaseAnon),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnon),
    },
    plugins: [
      react(),
      boothServerPlugin(adminPin, 5173),
    ],
    server: {
      port: 5173,
      host: true, // Listen on all network interfaces for booth
    },
  };
});
