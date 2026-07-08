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
        target: 'https://events.met.edu',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
