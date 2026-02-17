import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: {
        // background: 'src/background/index.ts',
        index: 'index.html',
        // content: 'src/content/index.ts',
        // inject: 'src/inject/index.ts',
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
