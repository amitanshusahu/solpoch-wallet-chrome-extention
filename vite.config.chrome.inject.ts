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
        inject: 'src/inject/index.ts',
      },
      output: [
        {
          entryFileNames: 'js/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          format: 'iife',
          name: 'SolpochInjectedScript',
          inlineDynamicImports: true,
        },
      ],
    },
  }
})
