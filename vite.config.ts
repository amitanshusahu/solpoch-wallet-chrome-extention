import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: 'src/background/index.ts',
        index: 'index.html',
        content: 'src/content/index.ts',
        inject: 'src/inject/index.ts',
      },
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es',
      },
    }
  }
})
