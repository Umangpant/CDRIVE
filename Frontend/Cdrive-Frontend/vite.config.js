// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; 

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for API calls (e.g., /api/products). Kept for development stability.
      '/api': { 
        target: 'http://localhost:8080', 
        changeOrigin: true, 
        secure: false 
      },
      // CRITICAL: Proxy for static image assets (e.g., /images/swift.webp).
      // This is the main reason your images aren't showing (404 Not Found without it).
      '/images': { 
        target: 'http://localhost:8080', 
        changeOrigin: true, 
        secure: false 
      },
    },
  }
});
