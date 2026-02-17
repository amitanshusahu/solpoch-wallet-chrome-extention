import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  build: {
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: {
        background: 'src/background/index.ts',
      },
      output: [
        {
          entryFileNames: 'js/[name].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          inlineDynamicImports: true,
          format: 'es',
        },
      ],
    },
  }
})
