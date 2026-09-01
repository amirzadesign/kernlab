import { resolve } from 'path';
import { defineConfig } from 'vite';

// KernLab is a small multi-page static site (game + about page).
// Vite needs to know about every HTML entry point so it bundles both.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  }
});
