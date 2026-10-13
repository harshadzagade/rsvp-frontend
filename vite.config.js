import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['events.met.edu'], // ✅ Add this line
    host: true,    
    port: 5173,
    hmr: {
      host: 'events.met.edu',
      protocol: 'wss',
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5350',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
