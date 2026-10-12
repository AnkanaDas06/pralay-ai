import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function pralayApiPlugin(): Plugin {
  return {
    name: 'pralay-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            // @ts-expect-error - internal ESM handler
            const { handleApiRequest } = await import('./src/server/apiHandler.mjs');
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
            return;
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            // @ts-expect-error - internal ESM handler
            const { handleApiRequest } = await import('./src/server/apiHandler.mjs');
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), pralayApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})
