import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      '*.repl.co',
      '*.repl.run'
    ]
  },
  preview: {
    allowedHosts: [
      '*.repl.co',
      '*.repl.run'
    ]
  }
});
