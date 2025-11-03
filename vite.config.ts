import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // AQUI DEFINIMOS O CAMINHO BASE PARA O GITHUB PAGES
  // O valor deve ser o nome do repositório entre barras: /NOME_DO_REPO/
  const base = '/diarioobraiabeta/';

  return {
    base: base, // Aplicamos o caminho base aqui
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    // Configuração de output para o build
    build: {
      outDir: 'dist',
    },
  };
});
