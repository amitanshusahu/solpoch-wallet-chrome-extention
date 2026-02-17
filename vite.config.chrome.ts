import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), nodePolyfills(), tailwindcss()],
  build: {
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: {
        index: 'index.html',
      },
      output: [
        {
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          format: 'es',
        },
      ],
    },
  }
})
