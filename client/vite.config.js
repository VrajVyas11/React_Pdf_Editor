// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['external-editor']
  }
,  
  server: {
    fs: {
      // Allow access to your entire project folder
      allow: [
        // Root project directory - allows all subdirectories
        path.resolve(__dirname)
      ]
    }
  },
  define: {
    global: 'window', // Define global for draft-js compatibility
  }
});
