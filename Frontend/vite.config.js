// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc'; 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';
  const port = Number(env.VITE_PORT || 5173);

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port,
      proxy: {
        // Proxy API calls to the Spring Boot backend during local development.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        },
        // Serve static backend-hosted images through the same dev server.
        '/images': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        },
      },
    },
  };
});
