import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, Vite serves the app on :5173 and forwards API calls to Nest on :3000,
// so the client always uses same-origin relative URLs (`/api/v1/...`).
// In production, Nest serves `web/dist` itself (see ServeStaticModule in app.module.ts).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
