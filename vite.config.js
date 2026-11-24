import { defineConfig, loadEnv } from 'vite';

// O navegador lê o estado direto do Supabase com a chave publishable (pública, só leitura pela RLS).
// Os nomes são os mesmos do .env e do painel da Netlify: SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.
// A chave secreta nunca entra aqui.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    define: {
      __SB_URL__: JSON.stringify((env.SUPABASE_URL || '').trim()),
      __SB_PUB__: JSON.stringify((env.SUPABASE_PUBLISHABLE_KEY || '').trim()),
      __VERSAO__: JSON.stringify(new Date().toISOString().slice(0, 16)),
    },
    build: { target: 'es2020', assetsInlineLimit: 0 },
    server: { port: 5180 },
    preview: { port: 5181 },
  };
});
