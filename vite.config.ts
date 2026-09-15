import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': { target: 'http://localhost:5000', changeOrigin: true },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // `vite preview` TIDAK mewarisi server.proxy di atas, jadi harus dideklarasikan
    // ulang. Tanpa ini, menguji build produksi secara lokal (`npm run preview`)
    // akan gagal konek ke backend — padahal build-nya sendiri benar.
    preview: {
      port: 3000,
      proxy: {
        '/api': { target: 'http://localhost:5000', changeOrigin: true },
      },
    },
  };
});
